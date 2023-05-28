
module.exports = {
	name: "interactionCreate",
	async execute(client, interaction) {
		if (interaction.isCommand()) return;

		await interaction.reply({ content: "ඞ", ephemeral: true });
	}
}