process.on('unhandledRejection', error => {
	console.log('Unhandled promise rejection:', error)
});

const { Client, Collection, version, GatewayIntentBits, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require("path");
require('dotenv').config({ path: '.env' })

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.commands = new Collection()

client.on("ready", async () => {
	console.log(`Ready! ${new Date(Date.now())}`)

	// await databaseConnect(); //connect to db before loading commands

	LoadEvents();
	LoadCommands();

	client.user.setPresence({ activities: [{ name: 'for your reports!', type: ActivityType.Watching }], status: 'online' });

	const rest = new REST({
		version: '9'
	}).setToken(process.env.TOKEN);

	let commandsData = client.commands.map(command => command.data.toJSON());
	try {
		await rest.put(
			Routes.applicationCommands(client.user.id), {
				body: commandsData
			},
		);
		console.log(`Registered ${commandsData.length} slash commands!`)
	} catch (error) {
		if (error) console.error(error);
	}
});

/*
// db stuff dont need yet

const { MongoClient } = require("mongodb");
const databaseConnect = async () => {
	const mongoClient = new MongoClient(process.env.MONGO_URL)
	await mongoClient.connect()
	const database = mongoClient.db(process.env.MONGO_DB)
	client.db = database;
	console.log(`Connected to database!`)
}
*/
client.on("debug", function(info){
	console.log(`Debug -> ${info}`);
});

function LoadEvents() {
	console.log(`\n\nLoading events...`)

	const eventsPath = path.join(__dirname, "events");
	const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

	for (file of eventsFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);

		client.on(event.name, (...args) => event.execute(client, ...args))

		console.log(`Loaded ${event.name}`)
	}
}

function LoadCommands() {
	console.log(`\n\nLoading commands...`)

	client.commands.clear();

	const commandsPath = path.join(__dirname, "commands");
	const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

	for (file of commandsFiles) {
		const filePath = path.join(commandsPath, file);
		delete require.cache[require.resolve(filePath)]; //allows for reloading at runtime
		const command = require(filePath);

		client.commands.set(command.data.name, command);

		console.log(`Loaded ${command.data.name}`)
	}
}

client.on('interactionCreate', async interaction => {    
	if (!interaction.isCommand()) return;
	
	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(client, interaction);
	} catch (error) {
		if (error) console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})

client.login(process.env.TOKEN)
