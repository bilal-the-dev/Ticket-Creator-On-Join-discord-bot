const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

const createChannel = async function (guild, member) {
	const channel = await guild.channels.create({
		name: member.user.username,
		parent: process.env.CATEGORY_ID,
		permissionOverwrites: [
			{
				id: guild.roles.everyone,
				deny: PermissionFlagsBits.ViewChannel,
			},
			{
				id: member,
				allow: PermissionFlagsBits.ViewChannel,
			},
		],
	});

	return channel;
};

const writeChannelData = async function (channel, userId) {
	const data = require("./../data.json");

	data.push({ channelId: channel.id, date: Date.now(), userId });

	fs.writeFile("./data.json", JSON.stringify(data), (err) => {
		if (err) console.log("Error writing to file:", err);
	});
};

const deleteChannelData = async function (channel) {
	const data = require("./../data.json");

	const index = data.findIndex((entry) => channel.id === entry.channelId);
	if (index === -1) return console.log("while deleting couldnt find");

	data.splice(index, 1);

	// console.log(data);

	fs.writeFile("./data.json", JSON.stringify(data), (err) => {
		if (err) console.log("Error writing to file:", err);
	});
};

const sendMessageInChannel = async (channel, embed, row) =>
	await channel.send({ embeds: [embed], components: [row] });

const sendLogs = async function (guild, channel) {
	const logs = await guild.channels.fetch(process.env.LOG_CHANNEL_ID);

	await logs.send(`Deleted the channel ${channel} (${channel.name})`);
};

module.exports = {
	createChannel,
	sendLogs,
	sendMessageInChannel,
	writeChannelData,
	deleteChannelData,
};
