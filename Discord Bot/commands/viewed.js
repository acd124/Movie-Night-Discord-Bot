const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = {
	name: "viewed",
	description: "Returns list of all movies that have been marked as viewed for server.",
	aliases: ["getviewed", "viewedlist"],
	execute(message, args, main) {
		let embeddedMessages = [];
		let number = 1;
		let description = "";
		let searchOptions = main.searchMovieDatabaseObject(message.guild.id, "");
		let movieEmbed = new MessageEmbed().setTitle("Viewed Movies").setColor("#6441a3");

		searchOptions.viewed = true;

		//2048 limit
		return main.movieModel.find(searchOptions, async (error, docs) => {
			if (error) return message.channel.send("Something went wrong trying to find the movies");
			
			if (!docs || !docs.length) {
				return message.channel.send("List of unviewed movies is currently empty.");
			}

			for (let movie of docs) {
				const stringConcat = `**[${number++}. ${movie.name}](https://www.imdb.com/title/${movie.imdbID})** submitted by <@${movie.submittedBy}>, viewed on ${moment(movie.viewedDate).format("DD MMM YYYY")}\n
				**Release Date:** ${moment(movie.releaseDate).format("DD MMM YYYY")} **Runtime:** ${movie.runtime} **Minutes Rating:** ${movie.rating}\n\n`;

				//If the length of message has become longer than DISCORD API max, we split the message into a seperate embedded message.
				if (description.length + stringConcat.length > 2048) {
					movieEmbed.setDescription(description);
					embeddedMessages.push(movieEmbed);
					description = "";
					movieEmbed = new MessageEmbed().setTitle("Viewed Movies (Cont...)").setColor("#6441a3");
				} 

				description += stringConcat;
			}

			movieEmbed.setDescription(description);
			embeddedMessages.push(movieEmbed);

			for (let embeddedMessage of embeddedMessages) {
				await message.channel.send(embeddedMessage);
			}

			return;
		}).lean();
	},
};