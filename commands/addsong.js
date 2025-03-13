const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { playlistCollection } = require('../mongodb.js');
const musicIcons = require('../UI/icons/musicicons.js');
const config = require('../config.js');

async function addSong(client, interaction, lang) {
    try {
        const playlistName = interaction.options.getString('playlist');
        const songInput = interaction.options.getString('input');
        const userId = interaction.user.id;

        const playlist = await playlistCollection.findOne({ name: playlistName });
        if (!playlist) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: lang.addsong.embed.playlistNotFound, 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription(lang.addsong.embed.playlistNotFoundDescription)
                .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (playlist.userId !== userId) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({ 
                    name: lang.addsong.embed.accessDenied, 
                    iconURL: musicIcons.alertIcon,
                    url: config.SupportServer
                })
                .setDescription(lang.addsong.embed.accessDeniedDescription)
                .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/gm;
        let song;

        if (urlPattern.test(songInput)) {
            song = { url: songInput };
        } else {
            song = { name: songInput };
        }

        await playlistCollection.updateOne(
            { name: playlistName },
            { $push: { songs: song } }
        );

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({ 
                name: lang.addsong.embed.songAdded, 
                iconURL: musicIcons.correctIcon,
                url: config.SupportServer
            })
            .setDescription(lang.addsong.embed.songAddedDescription.replace("{songInput}", songInput).replace("{playlistName}", playlistName))
            .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Lỗi khi thêm bài hát:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({ 
                name: lang.addsong.embed.error, 
                iconURL: musicIcons.alertIcon,
                url: config.SupportServer
            })
            .setDescription(lang.addsong.embed.errorDescription)
            .setFooter({ text: lang.footer, iconURL: musicIcons.heartIcon })
            .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    name: 'addsong',
    description: 'Thêm một bài hát vào danh sách phát',
    permissions: '0x0000000000000800',
    options: [
        {
            name: 'playlist',
            description: 'Nhập tên danh sách phát',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'input',
            description: 'Nhập tên bài hát hoặc URL',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: addSong
};
