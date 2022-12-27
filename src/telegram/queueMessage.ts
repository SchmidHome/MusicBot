//TODO

// bot.onText(/\/queue/, async (msg, match) => {
//     try {
//         const user = await User.getUser(msg.chat.id)
//         log(user, "/queue")
//         bot.sendMessage(user.chatId, "Queue:\n" + (await Promise.all((await getQueue()).map(getSong).map(async s =>
//             `*${(await s).name}*\n${(await s).artist} (${(await getScheduledTime((await s).spotifyUri)).toLocaleTimeString()})`))).join("\n\n"),
//             { parse_mode: "Markdown" })
//     } catch (error) {
//         console.error(error)
//     }
// })

// // ############################################## PLAYING
// bot.onText(/\/playing/, async (msg, match) => {
//     try {
//         const user = await User.getUser(msg.chat.id)
//         log(user, "/playing")
//         const currentUri = await getCurrentTrack()
//         if (!currentUri) {
//             bot.sendMessage(user.chatId, "No song is playing")
//         } else {
//             const currentSong = (await getSong(currentUri))
//             bot.sendMessage(user.chatId, "Currently playing:\n" + currentSong.name + " by " + currentSong.artist)
//         }
//     } catch (error) {
//         console.error(error)
//     }
// })
