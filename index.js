/* eslint-disable no-undef */
const {
	Client,
	Events,
	IntentsBitField: { Flags },
	PermissionFlagsBits,
} = require("discord.js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const cron = require("node-cron");

const {
	createChannel,
	sendMessageInChannel,
	writeChannelData,
	deleteChannelData,
	sendLogs,
} = require("./utils/channels");
const { generateEmbed, generateButton } = require("./utils/components");

const { TOKEN, GUILD_ID, TICKET_CLOSE_IN_DAYS } = process.env;

const client = new Client({
	intents: [
		Flags.Guilds,
		Flags.MessageContent,
		Flags.GuildMessages,
		Flags.GuildMembers,
	],
});

client.once(Events.ClientReady, async (readyClient) => {
	try {
		console.log(`Ready! Logged in as ${readyClient.user.tag}`);

		cron.schedule("* * * * *", async () => {
			console.log("Cron running every minute");
			const guild = client.guilds.cache.get(GUILD_ID);
			const DAY_IN_MS = 1000 * 60 * 60 * 24 * TICKET_CLOSE_IN_DAYS;
			// const DAY_IN_MS = 1000;

			const data = require("./data.json");
			for (const entry of data) {
				if (entry.date + DAY_IN_MS > Date.now()) continue;

				const channel = await guild.channels
					.fetch(entry.channelId)
					.catch((e) => console.log(e));

				await deleteChannelData(channel);
				await sendLogs(guild, channel);
				await channel.delete();
			}
		});
	} catch (error) {
		console.log(error);
	}
});

client.on(Events.GuildMemberAdd, async (member) => {
	try {
		const {
			guild,
			user: { id },
		} = member;

		const channel = await createChannel(guild, member);
		await writeChannelData(channel, id);

		const embed = generateEmbed(member);
		const button = generateButton();

		await sendMessageInChannel(channel, embed, button);
	} catch (error) {
		console.log(error);
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (!interaction.isButton()) return;

		const { customId, member, channel, guild } = interaction;

		if (customId !== "close") return;

		if (!isAdmin(member))
			return await interaction.reply({
				content: "Staff only!",
				ephemeral: true,
			});

		await interaction.reply("Deleting the ticket...");

		await deleteChannelData(channel);
		await sendLogs(guild, channel);

		await channel.delete();
	} catch (error) {
		console.log(error);
	}
});

client.on(Events.GuildMemberRemove, async (member) => {
	try {
		const data = require("./data.json");

		const {
			user: { id },
			guild,
		} = member;

		const channels = data.filter((entry) => entry.userId === id);

		console.log(channels);

		for (const entry of channels) {
			const channel = await guild.channels
				.fetch(entry.channelId)
				.catch((e) => console.log(e));

			await deleteChannelData(channel);
			await sendLogs(guild, channel);
			await channel.delete();
		}
	} catch (error) {
		console.log(error);
	}
});

client.login(TOKEN);

function isAdmin(member) {
	return member.permissions.has(PermissionFlagsBits.Administrator);
}
