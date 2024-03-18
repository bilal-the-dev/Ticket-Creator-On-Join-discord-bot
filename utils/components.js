const {
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ActionRowBuilder,
} = require("discord.js");

const generateEmbed = function (member) {
	const embed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle(`Welcome ${member.user.username}`)

		.setDescription(
			`Please wait until the staff approach you. The ticket will auto close after ${process.env.TICKET_CLOSE_IN_DAYS} day(s)`
		)
		.setThumbnail(member.displayAvatarURL());

	return embed;
};

const generateButton = function () {
	const close = new ButtonBuilder()
		.setCustomId("close")
		.setLabel("Close ticket")
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder().addComponents(close);
	return row;
};

module.exports = { generateEmbed, generateButton };
