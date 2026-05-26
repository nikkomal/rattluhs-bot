require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, REST, Routes, PermissionsBitField } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = '1508880305396908042';
const GUILD_ID = '1490867623083249908';

const CHANNELS = {
  news: '1508872859722842334',
  stats: '1508872874755100742',
  injuries: '1508873401278795868',
  rumors: '1508873612407345343',
};

const commands = [
  new SlashCommandBuilder().setName('result').setDescription('Post a game result').addStringOption(o => o.setName('score').setDescription('e.g. 6-3 W').setRequired(true)).addStringOption(o => o.setName('notes').setDescription('Any extra notes').setRequired(false)),
  new SlashCommandBuilder().setName('injury').setDescription('Post an injury update').addStringOption(o => o.setName('player').setDescription('Player name').setRequired(true)).addStringOption(o => o.setName('status').setDescription('e.g. OUT, QUESTIONABLE').setRequired(true)).addStringOption(o => o.setName('details').setDescription('Details').setRequired(true)),
  new SlashCommandBuilder().setName('rumor').setDescription('Post a rumor').addStringOption(o => o.setName('details').setDescription('Rumor details').setRequired(true)),
  new SlashCommandBuilder().setName('stats').setDescription('Post the current season stats'),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands }).then(() => console.log('Commands registered')).catch(console.error);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const member = interaction.member;
  const isGM = member.roles.cache.some(r => r.name === 'GM');
  if (!isGM) return interaction.reply({ content: 'You need the @GM role to use this.', ephemeral: true });

  const guild = interaction.guild;
  const { commandName } = interaction;

  if (commandName === 'result') {
    const score = interaction.options.getString('score');
    const notes = interaction.options.getString('notes') || '';
    const ch = guild.channels.cache.get(CHANNELS.news);
    const embed = new EmbedBuilder().setTitle('📰 RATTLUHS REPORT | Game Result').setColor(0x23a55a).addFields({ name: 'Result', value: `**${score}**`, inline: true }, { name: 'Notes', value: notes || 'None', inline: true }).setTimestamp();
    await ch.send({ embeds: [embed] });
    await interaction.reply({ content: 'Result posted!', ephemeral: true });
  }

  if (commandName === 'injury') {
    const player = interaction.options.getString('player');
    const status = interaction.options.getString('status');
    const details = interaction.options.getString('details');
    const ch = guild.channels.cache.get(CHANNELS.injuries);
    const color = status.toUpperCase() === 'OUT' ? 0xda373c : 0xf0b232;
    const embed = new EmbedBuilder().setTitle('🏥 INJURY REPORT | Update').setColor(color).addFields({ name: 'Player', value: `**${player}**`, inline: true }, { name: 'Status', value: `**${status.toUpperCase()}**`, inline: true }, { name: 'Details', value: details }).setTimestamp();
    await ch.send({ embeds: [embed] });
    await interaction.reply({ content: 'Injury update posted!', ephemeral: true });
  }

  if (commandName === 'rumor') {
    const details = interaction.options.getString('details');
    const ch = guild.channels.cache.get(CHANNELS.rumors);
    const embed = new EmbedBuilder().setTitle('👀 RATTLUHS RUMORS DESK').setColor(0xf0b232).setDescription(details).setTimestamp();
    await ch.send({ embeds: [embed] });
    await interaction.reply({ content: 'Rumor posted!', ephemeral: true });
  }

  if (commandName === 'stats') {
    const ch = guild.channels.cache.get(CHANNELS.stats);
    const embed = new EmbedBuilder().setTitle('📊 RATTLUHS SKATER STATS').setColor(0x5865f2).setDescription(
      '👑 **UWPE** (C) — 108 GP | 321G 192A | 513 PTS | +182\n' +
      '🔥 **Jowaay2Shiesty** (LW) — 91 GP | 150G 155A | 305 PTS | +155\n' +
      '🎯 **No Plxg** (D) — 26 GP | 51G 40A | 91 PTS | +35\n' +
      '🛡️ **v CIxmpz** (D) — 70 GP | 29G 146A | 175 PTS | +117\n' +
      '🛡️ **Beaszy3682** (D) — 99 GP | 12G 143A | 155 PTS | 455 Hits\n' +
      '🏒 **Zennbobwe** (RW) — 9 GP | 3G 14A | 17 PTS\n\n' +
      '🥅 **UWPQ** — 66 GP | 44W | .730 SV% | 9 SO\n' +
      '🥅 **v CIxmpz** — 25 GP | 22W | .780 SV% | 4 SO'
    ).setTimestamp();
    await ch.send({ embeds: [embed] });
    await interaction.reply({ content: 'Stats posted!', ephemeral: true });
  }
});

client.login(TOKEN);

