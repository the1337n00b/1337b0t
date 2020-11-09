# 1337b0t
does 1337 things

Pending Tasks:

!delegate server add/remove/list @username
!op server add/remove/list @username
  ~ op array should contain objects like: {name: 'keith', id: 12345} to allow removing via saved name (using @ will remove via user_id)

!list_permissions - show all permissions - this would be equiv to running !admin list & !op list & !delegate list
  ~!permissions
  ~!perms

!dm_toggle enable owner/admins to toggle requiring DMs

!do_server game_name add/remove
  ~may add a json parser for the first go pass to speed up dev?

!play do_server_game_name - will start when req_votes is met within 3 minutes

update status to use embeds
https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor
https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable

!help
