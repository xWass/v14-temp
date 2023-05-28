const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('command-name')
		.setDescription("sus command")
		.setDMPermission(false),
	async execute(client, interaction) {
		await interaction.reply({ content: "ඞ", ephemeral: true });
	}
};
