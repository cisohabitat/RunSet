// Plain Simplified Chinese. Keep game terms consistent: 同数组 / 顺子 / 万能牌.
// Placeholders named name* preserve player-entered names exactly.
const messages: Record<string, string> = {
  "Loading rules…": "正在加载规则…",
  "Practice uses its own tiles. Your saved game is safe.":
    "练习使用独立的牌局，不影响你保存的正式游戏。",
  "{name}’s completed game": "{name} 已完成的游戏",
  "{name}’s saved game": "{name} 保存的游戏",
  "Round {n}:": "第 {n} 局：",
  "Deal round {n} →": "发牌，开始第 {n} 局 →",
  "Game menu": "游戏菜单",
  Game: "游戏",
  Menu: "菜单",
  "Game options": "游戏选项",
  "Playing options": "游戏设置",
  "Explain penalties before ending a turn": "结束回合前，先提醒是否会被罚摸牌",
  "Explain opponent moves": "说明电脑的出牌",
  "Larger touch controls": "使用大牌和大按钮",
  "Opponent pace": "电脑出牌速度",
  Quick: "快一些",
  Comfortable: "适中",
  "Take my time": "慢慢来",
  "Delete saved game": "删除已保存的游戏",
  "Practice without losing this game": "去练习（保留当前游戏）",
  "Keyboard controls": "键盘操作",
  "Use left/right arrows or Home/End within tiles. Space selects. N places selected tiles in a new group or run. Ctrl/⌘ Z undoes. Escape clears selection. H asks for a hint.":
    "用左右方向键或 Home、End 键移动到手牌。空格键选牌；N 键把选中的牌组成新的同数组或顺子；Ctrl/⌘ Z 撤销；Esc 取消选择；H 查看提示。",
  "RunSet home": "RunSet 首页",
  "A GOOD TIME, WELL PLAYED.": "动动脑，慢慢玩。",
  Home: "首页",
  "Ending now restores your moves and draws up to three penalty tiles.":
    "现在结束会撤回本回合的操作，并罚摸最多 3 张牌。",
  "Reset turn instead": "改为重置本回合",
  "Your progress": "游戏进度",
  "on this browser. Sound and learning preferences are kept.":
    "（仅限此浏览器）。声音和学习设置会保留。",
  "Dismiss notice": "关闭通知",
  "Preparing your practice table…": "正在准备练习…",
  "A classic game. A fresh perspective.": "经典数字牌，轻松动动脑。",
  "How to play →": "玩法说明 →",
  "MADE FOR THE LOVE OF THE GAME": "享受游戏，慢慢来",
  "THE TABLE": "牌桌",
  "Rules →": "规则 →",
  "Match scores": "比赛积分",
  "First to": "目标分数：",
  "Time left this turn": "本回合剩余时间",
  "Time left:": "剩余时间：",
  "s · on expiry: reset unfinished edits and":
    "秒 · 时间到：撤回未完成的操作，然后",
  tiles: "张牌",
  "Taking a turn": "正在出牌",
  "in the pool": "张待摸的牌",
  "First real game guidance": "第一局游戏指导",
  "Your first real game": "开始第一局",
  "Got it — hide coaching": "知道了，关闭指导",
  "Move hint": "出牌提示",
  "Place hint": "按提示摆牌",
  "Dismiss hint": "关闭提示",
  "Why this works": "为什么这样出牌？",
  "Table start ↑": "牌桌顶部 ↑",
  "Table end ↓": "牌桌底部 ↓",
  "Scroll the table to see more groups and runs.":
    "上下滑动牌桌，可以看到更多牌组。",
  "Table melds": "牌桌上的牌组",
  "MAKE ROOM FOR A GOOD IDEA": "想一想，怎样把牌接起来？",
  Round: "局数：",
  "· Turn": "· 回合：",
  "New group or run": "新建同数组或顺子",
  "Every good game": "先找一组牌，",
  "starts with a possibility.": "试着摆上牌桌。",
  "Open with 30 points from your rack.":
    "第一次出牌，必须用自己的手牌凑够 30 分。",
  "Opening points:": "首次出牌分数：",
  ". Need at least 30.": "。至少需要 30 分。",
  "Your rack": "你的手牌区",
  "’s rack": "的手牌",
  Sort: "排序",
  Colour: "按颜色",
  Number: "按数字",
  "Your tiles. Use left and right arrows to navigate.":
    "你的手牌。可用左右方向键移动。",
  "Place selected": "摆放选中的牌",
  "Deselect all": "取消选择",
  "Undo move": "撤销上一步",
  Undo: "撤销",
  "Reset turn": "重置本回合",
  Reset: "重置",
  More: "更多",
  "Return selected tiles to rack": "将选中的牌收回手牌区",
  "Move history": "出牌记录",
  "Match scoreboard": "比赛计分板",
  "total points": "总分",
  "Round scores": "各局得分",
  Winner: "获胜者",
  "tiles remaining · rack value": "张剩余手牌 · 手牌分数：",
  "Deal round": "发牌，开始第",
  "Play again →": "再玩一局 →",
  "THE CLASSIC, WITH A FRESH SHUFFLE": "数字牌游戏 · 一步一步学",
  "A little strategy.": "动动脑，",
  "A perfect": "轻松玩",
  "run.": "数字牌。",
  "Be the first to play all the tiles from your rack. Match numbers in different colours, or build a sequence in one colour. New to tile-rummy? We’ll teach you, one move at a time.":
    "先把手牌全部出完的人获胜。可以把数字相同、颜色不同的牌放在一起，也可以把同色的连续数字接起来。第一次玩？点“学习玩法”，一步一步跟着做。",
  "Learn to play": "学习玩法",
  "New game →": "开始新游戏 →",
  "How to play": "玩法说明",
  "Saved game": "已保存的游戏",
  "’s": "的",
  game: "游戏",
  "opponent(s) ·": "位电脑对手 ·",
  "✓ Free to play": "✓ 免费玩",
  "✓ No sign-up": "✓ 不用注册",
  "✓ Just one more round": "✓ 随时休息，随时继续",
  "Illustration of tile runs and sets": "顺子和同数组示例",
  "A GOOD HAND IS ONLY THE BEGINNING.": "看数字，认颜色，慢慢组合。",
  "make a run →": "同色连续，组成顺子 →",
  "find your set": "同数异色，组成同数组",
  "106 TILES. ENDLESS POSSIBILITIES.": "106 张牌，多种组合。",
  "YOUR TABLE IS ALWAYS OPEN": "随时来玩一局",
  "One player. Clever opponents. A whole lot of possibilities.":
    "一个人也能玩，电脑陪你练。",
  "← Back": "← 返回",
  "FIVE MINUTES TO YOUR FIRST MOVE": "从认识牌开始",
  "Small tiles.": "小小数字牌，",
  "Big possibilities.": "慢慢学会玩。",
  "Based on the classic tile-rummy game. Your goal is simple: be the first to empty your rack.":
    "这是经典的数字牌游戏。目标很简单：比其他人先把自己的手牌全部出完。",
  "01 / THE TILES": "01 / 认识牌",
  "A colourful cast.": "看数字，也看颜色。",
  "106 tiles: two of every number from 1 to 13 in four colours, plus two jokers. Everyone starts with 14 tiles. Shape marks make colours easy to tell apart.":
    "共有 106 张牌：红、蓝、橙、黑四种颜色，每种颜色有 1 到 13，每个数字各两张，另有两张万能牌。每人开局拿 14 张。牌上的形状标记也能帮助分辨颜色。",
  "02 / GROUPS": "02 / 同数组",
  "Same number. Different colours.": "数字相同，颜色不同。",
  "A group has 3 or 4 tiles of the same number, each a different colour. Duplicate colours don’t count.":
    "同数组由 3 张或 4 张数字相同、颜色各不相同的牌组成。例如：红 7、蓝 7、橙 7。同一个组里不能有重复颜色。",
  "03 / RUNS": "03 / 顺子",
  "One colour. In sequence.": "颜色相同，数字连续。",
  "A run has at least 3 consecutive numbers of one colour. 1 is always low: 12, 13, 1 is never a run.":
    "顺子至少需要 3 张同色、数字连续的牌。例如：蓝 3、蓝 4、蓝 5。1 只能接在 2 前面，不能把 12、13、1 接成顺子。",
  "04 / JOKERS": "04 / 万能牌",
  "A little wild.": "缺哪张，就代替哪张。",
  "A joker stands in for a missing tile. Here it counts as 5. To retrieve a table joker, replace it with the exact rack tile it represents and reuse it in a valid meld that turn. For groups, the joker’s missing colour follows red, blue, orange, black order.":
    "万能牌可以代替一张缺少的牌。图中它代替红 5。如果想拿来另用，必须先用手中相同颜色、相同数字的牌替换它，再在本回合把它用到有效牌组中。同数组里的万能牌，按红、蓝、橙、黑的顺序代表缺少的颜色。",
  "05 / YOUR OPENING": "05 / 第一次出牌",
  "Make your first 30.": "先凑够 30 分。",
  "Your first play must total at least 30 points, using only tiles from your own rack. A joker counts as the number it replaces. Until then, leave existing table melds untouched.":
    "第一次出牌叫“开局”，只能用自己的手牌，总分至少 30 分。每张牌按数字计分，万能牌按它代替的数字计分。开局完成前，不能动牌桌上已有的牌。",
  "06 / EACH TURN": "06 / 每个回合",
  "Play. Or draw.": "出牌，或者摸一张。",
  "Play at least one rack tile, then end your turn. Or draw one tile and your turn ends. Drawing first restores unfinished moves. No pool left? Pass instead. Everyone passing in succession ends the game.":
    "轮到你时，可以至少出一张手牌，再点“结束回合”。也可以点“摸一张牌”，摸牌后回合自动结束，未完成的摆牌会撤回。没有牌可摸时，改点“跳过”。所有人连续跳过后，本局结束。",
  "Watch the red outline:": "留意红色边框：",
  "ending an invalid turn restores your moves and draws 3 penalty tiles, or as many as remain. Reset turn undoes your moves freely.":
    "如果牌组不合规则就结束回合，本回合操作会撤回，并罚摸 3 张牌（不够则摸完剩余牌）。点“重置”可以撤回本回合操作，不会罚摸。",
  "07 / REARRANGE": "07 / 重新组合",
  "See a new possibility?": "开局后，可以重新组牌。",
  "After opening, split, merge, and rearrange table melds freely. Every tile must belong to a valid meld when you finish. Table tiles can never go back to a rack.":
    "完成开局后，可以拆开、合并或重排牌桌上的牌。结束回合时，每张牌都必须属于有效的同数组或顺子。桌上原有的牌不能收回手牌区。",
  "Tap or click tiles to select, then choose a meld or “New meld”. You can also drag a tile or selection. To return tiles you placed this turn, choose More, then Return selected tiles to rack. Keyboard: Tab to tiles, Space to select, then activate a destination button.":
    "先点选要出的牌，再点已有牌组或“新建同数组或顺子”。也可以拖动牌。想收回本回合刚出的牌，先选中它们，再点“更多”里的“将选中的牌收回手牌区”。用键盘时，按 Tab 移到牌上，空格选牌，再选择放牌位置。",
  "08 / WINNING": "08 / 怎样获胜",
  "Leave nothing behind.": "先出完手牌就赢。",
  "First to empty their rack wins. Each other player loses their remaining tile total (jokers count as 30); the winner earns the sum. When the pool runs out and everyone passes, the lowest rack total wins; a tie goes to the first tied player in seat order.":
    "先出完手牌的人获胜。其他人扣除剩余手牌的总分，万能牌每张按 30 分算；赢家获得其他人所扣分数之和。如果牌摸完后所有人连续跳过，则剩余手牌总分最低的人获胜；同分时，座位顺序靠前者获胜。",
  "Your round saves automatically, even mid-turn. Head home and choose Continue whenever you’re ready.":
    "游戏会自动保存在这个浏览器里，回合中途也能保存。下次回到首页，点“继续游戏”即可接着玩。",
  "Got it. Let’s play →": "明白了，去玩 →",
  "Offline and installation": "离线游戏与安装",
  "A new version is ready. Your saved game will be kept.":
    "有新版本可用。更新会保留已保存的游戏。",
  "Save and update": "保存并更新",
  "Install or play offline": "安装或离线玩",
  "On iPhone or iPad, open this site in Safari, tap Share, then Add to Home Screen. On desktop or Android, use your browser’s Install app option. Visit once online to download the game; regular games and lessons then work offline once “Ready offline” is shown.":
    "iPhone 或 iPad：用 Safari 打开本网站，点“分享”，再点“添加到主屏幕”。电脑或安卓设备：使用浏览器的“安装应用”功能。先联网打开一次，等显示“可以离线玩”后，游戏和练习就能在没有网络时使用。",
  "Save tools": "存档工具",
  "Save and recovery": "保存与恢复",
  "Export game backup": "下载游戏备份",
  "Import game backup": "导入游戏备份",
  "Recover previous position": "恢复之前的进度",
  "About backups and recovery": "备份和恢复说明",
  "Progress stays in this browser. Download a backup to keep a separate copy or move your game to another device. Timed backups retain their original deadline. Deleting a game also clears its automatic recovery copy; downloaded files remain yours.":
    "游戏进度只保存在当前浏览器中。下载备份可另存一份，也可把游戏转到其他设备。计时游戏的备份保留原来的截止时间。删除游戏也会删除自动恢复副本，但不会删除你下载的文件。",
  "Recovery available:": "可恢复的进度：",
  "· turn": "· 回合：",
  ". Recovery may restore an earlier turn or a previously replaced game.":
    "。恢复可能回到较早的回合，或找回之前被替换的游戏。",
  "PULL UP A CHAIR": "准备好，慢慢玩",
  "Your table.": "选好对手，",
  "Your pace.": "按自己的节奏玩。",
  "Settle in for a round or a longer match of tile-rummy.":
    "可以只玩一局，也可以选择多局累计积分。",
  "What should we call you?": "你的名字或昵称",
  "Computer opponents": "电脑对手人数",
  "A little challenge?": "选择难度",
  "How long would you like to play?": "想玩多久？",
  "Game length": "游戏局数与积分",
  "One round": "只玩一局",
  "Match · first to 100 points": "多局比赛 · 先到 100 分获胜",
  "Match · first to 200 points": "多局比赛 · 先到 200 分获胜",
  "Match · first to 500 points": "多局比赛 · 先到 500 分获胜",
  "Optional turn timer": "回合计时（可不开）",
  "Time per turn": "每回合时间",
  "No timer · recommended for learning": "不计时 · 初学建议选这个",
  "1 minute": "1 分钟",
  "2 minutes": "2 分钟",
  "When time runs out, unfinished edits are restored and you draw one tile (or pass if the pool is empty). The clock keeps running when you leave the game.":
    "时间到后，未完成的摆牌会撤回，并摸一张牌；没有牌可摸时则跳过。离开游戏页面后，计时仍会继续。",
  "Starting a new game replaces your saved round.":
    "开始新游戏会替换当前保存的游戏。",
  "Deal the tiles": "发牌，开始游戏",
  "Guided practice": "跟着学",
  "· SAVED GAME UNCHANGED": "· 不影响已保存的游戏",
  "Exit practice": "退出练习",
  "Practice progress": "练习进度",
  "Completed lesson table": "练习完成后的牌桌",
  "Your finished table": "你完成的牌桌",
  "points · valid": "分 · 符合规则",
  "Play against one Easy opponent →": "和一位简单电脑对手玩 →",
  "Restart lesson": "重新练习本课",
  Basics: "基础玩法",
  Jokers: "万能牌",
  Rearranging: "重新组牌",
  // Screen states, confirmations, storage and backup messages.
  Saved: "已保存",
  "No saved game": "没有已保存的游戏",
  "Saving…": "正在保存…",
  "Changed in another tab": "游戏已在另一个标签页更改",
  "Not saved": "尚未保存",
  "This game changed in another tab. The latest saved position has been loaded.":
    "游戏在另一个标签页中有变动，已载入最新保存的进度。",
  "This position failed validation and was not saved. Your previous saved game is preserved.":
    "当前牌局未通过检查，没有保存。之前的存档仍然保留。",
  "Browser storage is unavailable. This round cannot be saved.":
    "浏览器无法保存数据，这一局暂时不能保存。请保持此页面打开。",
  "Updated to the game saved in another tab.":
    "已更新为另一个标签页保存的游戏。",
  "The saved game was deleted in another tab.":
    "已保存的游戏在另一个标签页中被删除。",
  "The backup has been validated. Saved games keep their original turn and timer.":
    "备份已检查通过。恢复后会保留原来的回合和计时。",
  "Rematch with same players": "用相同设置再玩一次",
  "Restart with same players": "用相同设置重新开始",
  "Unmute sound": "打开声音",
  "Mute sound": "关闭声音",
  "♪ Off": "♪ 静音",
  "♫ On": "♫ 有声",
  "This turn would draw penalty tiles": "这样结束回合会被罚摸牌",
  "Delete this saved game?": "确定删除这个游戏吗？",
  "Replace your saved game?": "确定替换已保存的游戏吗？",
  "Keep editing": "继续调整",
  "Keep game": "保留游戏",
  "End turn +3 tiles": "结束回合，罚摸 3 张",
  "Delete game": "删除游戏",
  "Start new game": "开始新游戏",
  "That turn has already ended.": "那个回合已经结束。",
  "The saved game could not be deleted. Your progress is still available.":
    "删除未成功，你的游戏进度仍然保留。",
  "will be removed": "将被删除",
  "will be replaced": "将被替换",
  Confirm: "确定",
  Cancel: "取消",
  "Working…": "正在处理…",
  "Backup downloaded. Keep the file somewhere you can find it.":
    "备份已下载。请把文件保存在容易找到的地方。",
  "Choose a RunSet JSON backup smaller than 2 MB.":
    "请选择小于 2 MB 的 RunSet JSON 备份文件。",
  "Backup validated. If a game already exists, confirm before replacing it.":
    "备份检查通过。如果已有游戏，需要先确认才会替换。",
  "This position could not be validated for export.":
    "当前牌局未通过检查，无法导出备份。",
  "This backup is too large. Choose a RunSet JSON file smaller than 2 MB.":
    "备份文件太大。请选择小于 2 MB 的 RunSet JSON 文件。",
  "This file is not readable JSON. Your current game is unchanged.":
    "无法读取这个 JSON 文件。当前游戏没有改变。",
  "This is not a supported, complete RunSet backup. Your current game is unchanged.":
    "这个文件不是受支持的完整 RunSet 备份。当前游戏没有改变。",
  "Recovered your game by clearing damaged Undo history. Your current tiles and turn are unchanged.":
    "已清除损坏的撤销记录，恢复了游戏。当前的牌和回合没有改变。",
  "An old or unreadable save was discarded. Start a fresh game.":
    "旧存档无法读取，已清除。请开始新游戏。",
  "Your save could not be read. You can still start a new game.":
    "无法读取存档。你仍然可以开始新游戏。",
  "Offline setup is unavailable. You can continue playing online.":
    "暂时无法设置离线功能。联网时仍可继续游戏。",
  "The update is paused because your game could not be saved. Keep this tab open.":
    "游戏未能保存，更新已暂停。请保持此标签页打开。",
  "Offline · game, lessons and bots are ready.":
    "当前离线 · 游戏、练习和电脑对手均可使用。",
  "Ready offline": "可以离线玩",
  "Preparing offline play…": "正在准备离线功能…",
  "Offline readiness could not be verified. Connect and finish any available update.":
    "尚未确认离线功能可用。请联网，并完成可用的更新。",
  // Setup, gameplay, score and save summaries.
  opponent: "位对手",
  opponents: "位对手",
  "Easy does it": "简单 · 慢慢学",
  "A fair match": "普通 · 练练手",
  "Think ahead": "困难 · 多想一步",
  "New melds only. Room to learn.": "电脑只出新的牌组，适合初学。",
  "Clever sets and well-timed additions.": "电脑会组合牌，也会给已有牌组接牌。",
  "Rearranges the table. Bring your best.":
    "电脑会重新组合桌上的牌，更有挑战。",
  easy: "简单",
  normal: "普通",
  hard: "困难",
  "Your move.": "轮到你了。",
  "A little thinking…": "电脑正在想…",
  "draw one": "摸一张牌",
  pass: "跳过",
  "· opened": "· 已开局",
  "· not opened yet": "· 还未开局",
  "Watch the opponent. Your turn comes next.": "先看电脑出牌，接下来就轮到你。",
  "Your opening is worth {n} points. Choose End turn to complete your first play.":
    "你已凑够 {n} 分。点“结束回合”，就完成第一次出牌了。",
  "Look for a matching-number group or a same-colour run. Your first play needs 30 points. Hint can explain a possibility; {action} is always allowed.":
    "找一组数字相同、颜色不同的牌，或一串同色的连续数字。第一次出牌至少要 30 分。“提示”可以帮你找组合；也可以选择{action}。",
  drawing: "摸牌",
  passing: "跳过",
  draw: "摸牌",
  "You have opened! Add tiles to existing groups or runs, make new ones, or {action}. You can turn these tips off whenever you’re ready.":
    "你已完成开局！现在可以给桌上的牌组接牌、组成新牌组，或{action}。熟悉后可以关闭这些指导。",
  "Expand table": "展开牌桌",
  "Compact table": "收起牌桌",
  "group · {n} pts": "同数组 · {n} 分",
  "run · {n} pts": "顺子 · {n} 分",
  "Incomplete group or run": "牌组尚未凑齐",
  "incomplete group or run": "牌组尚未凑齐",
  "Add selected tiles to meld {n}": "将选中的牌加入第 {n} 个牌组",
  "Place {n} selected": "放入选中的 {n} 张牌",
  "Select tiles, then place here": "先选牌，再点这里摆放",
  "{n} tile{s} played this turn": "本回合已出 {n} 张牌",
  "Opening meld: {n} / 30 points": "首次出牌：{n} / 30 分",
  "{name} is finding a move…": "{name} 正在想怎样出牌…",
  "Compact rack": "收起手牌区",
  "Expand rack": "展开手牌区",
  "Finding a move…": "正在寻找出牌方法…",
  "Show a possible move": "查看出牌提示",
  "Thinking…": "正在想…",
  Hint: "提示",
  "{n} selected": "已选 {n} 张",
  "Select tiles": "请先选牌",
  "Draw a tile": "摸一张牌",
  Pass: "跳过",
  "End turn →": "结束回合 →",
  "+3 tiles · End turn": "罚摸 3 张 · 结束回合",
  "ROUND {n} COMPLETE": "第 {n} 局结束",
  "THAT’S A WRAP": "本局结束",
  "Beautifully played.": "你赢了！",
  "{name} takes it.": "{name} 获胜。",
  "The table was full of possibilities. You found yours.":
    "你找到了好组合，出完了手牌！",
  "A good game always leaves room for another.":
    "这一局结束了。休息一下，也可以再试一局。",
  "First to {n}": "先到 {n} 分获胜",
  "{name} wins the match!": "{name} 赢得整场比赛！",
  "View results →": "查看结果 →",
  "Continue game →": "继续游戏 →",
  completed: "已完成的",
  saved: "已保存的",
  "Match to {n} · round {r} ·": "目标 {n} 分 · 第 {r} 局 ·",
  "Round finished": "本局已结束",
  "{name}’s turn": "轮到 {name}",
  "· round {n}": "· 第 {n} 局",
  // Tile labels, including screen readers and the joker's represented value.
  "red {n}": "红 {n}",
  "blue {n}": "蓝 {n}",
  "orange {n}": "橙 {n}",
  "black {n}": "黑 {n}",
  red: "红色",
  blue: "蓝色",
  orange: "橙色",
  black: "黑色",
  "one colour": "同色",
  Joker: "万能牌",
  WILD: "万能",
  "the joker": "万能牌",
  "Joker represents {tile}": "万能牌代替{tile}",
  "Joker representing {tile}": "万能牌，代替{tile}",
  Run: "顺子",
  Group: "同数组",
  // All three lessons, intermediate states and recoverable feedback.
  "Make a group": "组成同数组",
  "Select the three 10s below → New group or run. Groups match numbers in different colours.":
    "先选中下面三张 10，再点“新建同数组或顺子”。数字相同、颜色不同的牌可以组成同数组。",
  "Make a run": "组成顺子",
  "Select red 1, 2 and 3 → New group or run. A run has consecutive numbers in one colour.":
    "先选中红 1、红 2、红 3，再点“新建同数组或顺子”。同色、数字连续的牌可以组成顺子。",
  "Your first 30 points": "第一次出牌至少 30 分",
  "Your 10s score 30. Red 1 + 2 + 3 adds 6. Your opening is 36 points; at least 30 is required.":
    "三张 10 共 30 分。红 1 + 2 + 3 再加 6 分，一共 36 分。第一次出牌至少要 30 分，你已经够了！",
  "Finish your turn": "结束你的回合",
  "Choose End turn. You played tiles from your rack and left every group and run valid.":
    "点“结束回合”。你已经出了手牌，而且桌上的每个同数组和顺子都符合规则。",
  "Watch the opponent": "看看电脑怎么做",
  "Juniper will draw from the pool: the shared pile of face-down tiles. Drawing ends a turn.":
    "电脑 Juniper 会摸一张牌。“待摸的牌”是大家共用、背面朝上的牌堆。摸牌后，回合就结束。",
  "Try drawing": "试着摸一张牌",
  "Choose Draw a tile. Drawing resets unfinished edits, adds one tile to your rack, and ends your turn.":
    "点“摸一张牌”。摸牌会撤回未完成的摆牌，给你的手牌加一张，并结束这个回合。",
  "Try an incomplete play": "试试没有凑齐的牌组",
  "Place red 13 → New group or run, then Reset. Invalid End draws 3 penalty tiles; Reset is free.":
    "选红 13，点“新建同数组或顺子”，再点“重置”。没有凑齐就结束会罚摸 3 张牌；点“重置”则不会罚摸。",
  "You know the basics": "你已学会基础玩法",
  "Empty your rack to win. On each turn, play tiles or draw one. Your first play needs 30 points; after that you can add to or rearrange the table. Try an Easy game, or explore the optional lessons.":
    "先出完手牌就赢。每回合选择出牌，或摸一张。第一次出牌至少 30 分，之后可以接牌或重组桌上的牌。可以开始一局简单游戏，也可以继续学习下面的选修课。",
  "Reuse the table joker": "把万能牌用到新牌组里",
  "Red 5 fills the old gap. The joker is still on the table, now shown as red 7. Select it with blue 5 and orange 5 → New group or run.":
    "红 5 已补上原来的空位。万能牌还在桌上，现在显示为红 7。选中它和手里的蓝 5、橙 5，再点“新建同数组或顺子”。",
  "Retrieve a joker": "替换桌上的万能牌",
  "The table joker represents red 5. Select your red 5 and add it to that run. The joker stays on the table until you reuse it in the next step.":
    "桌上的万能牌现在代替红 5。选中手中的红 5，再点那个顺子的加号。万能牌会先留在桌上，下一步再把它用到新的牌组里。",
  "Split a run": "把长顺子拆成两组",
  "Select the table’s red 4 and 5 plus your red 6 and 7 → New group or run. You’ll leave red 1–3 and make red 4–7. Rearrange only after opening.":
    "选中桌上的红 4、红 5，再选手中的红 6、红 7，点“新建同数组或顺子”。这样就留下红 1–3，并组成红 4–7。完成开局后才可以这样重组。",
  "Joker lesson complete": "万能牌练习完成",
  "Your red 5 replaced the joker’s original role. You reused the joker with blue 5 and orange 5, leaving both groups and runs valid. Here is your finished table.":
    "你用红 5 替换了万能牌原来的位置，再把万能牌与蓝 5、橙 5 组成新的同数组。每个牌组都符合规则。下面是你完成的牌桌。",
  "Run-splitting lesson complete": "拆分顺子练习完成",
  "You split red 1–5 and added your red 6 and 7. Red 1–3 and red 4–7 are both valid runs. Here is your finished table.":
    "你拆开了红 1–5，并加入手中的红 6、红 7。现在红 1–3 和红 4–7 都是有效的顺子。下面是你完成的牌桌。",
  "FIRST GAME · {n} / 7": "基础练习 · 第 {n} / 7 步",
  "OPTIONAL LESSON": "选修练习",
  "I see: 30 + 6 = 36 →": "明白了：30 + 6 = 36 →",
  "Watch Juniper draw →": "看 Juniper 摸牌 →",
  "Practice progress cannot be saved in this browser. Your regular game is unchanged.":
    "这个浏览器无法保存练习进度。你的正式游戏没有改变。",
  "For this step, select {tiles}. Other tiles can wait.":
    "这一步请选择{tiles}，其他牌先不用动。",
  "This exercise uses {tiles}. Select those tiles and choose the outlined destination.":
    "这次练习用到{tiles}。请先选中这些牌，再点有边框提示的放牌位置。",
  "First finish this step: {instruction} No turn or penalty was applied.":
    "请先完成这一步：{instruction} 回合没有结束，也没有罚摸牌。",
  "Finish the highlighted exercise first, or restart the lesson. No turn or penalty was applied.":
    "请先完成有提示的练习，或重新开始本课。回合没有结束，也没有罚摸牌。",
  "Practice tip: {reason} Keep editing or reset; no penalty has been applied.":
    "练习提醒：{reason} 可以继续调整或重置，没有罚摸牌。",
  // Rules and engine messages stay in English in saves. Translate at display only.
  "Every meld needs a valid group or run.":
    "桌上的每个牌组都必须是有效的同数组或顺子。",
  "Table tiles must stay on the table.": "桌上原有的牌必须留在牌桌上。",
  "Your opening meld must total at least 30 using only your rack.":
    "第一次出牌只能用自己的手牌，合计至少 30 分。",
  "Replace a joker with its represented rack tile, then reuse it this turn.":
    "先用手中同色同数的牌替换万能牌，再在本回合把万能牌组成有效牌组。",
  "Open with 30 points before rearranging table tiles.":
    "先完成至少 30 分的首次出牌，才能重组桌上的牌。",
  "Your opening meld must come entirely from your rack.":
    "第一次出牌必须全部使用自己的手牌。",
  "Table tiles cannot return to your rack.": "桌上原有的牌不能收回手牌区。",
  "Play at least one rack tile, or draw to end your turn.":
    "请至少出一张手牌，或摸牌来结束回合。没有牌可摸时可跳过。",
  "Undid the last move.": "已撤销上一步。",
  "The tiles are dealt. Let’s make a little magic.":
    "牌已发好，找一找可以组成哪些牌组吧。",
  "{name} passed.": "{name} 跳过本回合。",
  "{name} drew a tile.": "{name} 摸了一张牌。",
  "{name} played {n} tile{s}.": "{name} 出了 {n} 张牌。",
  "{name}: invalid turn — {reason} Drew penalty tiles.":
    "{name}：本回合不符合规则。{reason} 已撤回操作，并罚摸牌。",
  "Time’s up. {notice}": "时间到了。{notice}",
  "Round {n}: first to {target} points wins the match.":
    "第 {n} 局：先达到 {target} 分的人赢得比赛。",
  "{notice} They {detail}.": "{notice} 出牌说明：{detail}。",
  "made a matching-number group ({numbers})": "组成同数组（{numbers}）",
  "added to a matching-number group ({numbers})": "给同数组接牌（{numbers}）",
  "made a same-colour run ({numbers})": "组成顺子（{numbers}）",
  "added to a same-colour run ({numbers})": "给顺子接牌（{numbers}）",
  // Hints, meld explanations and every planner fallback.
  "Matching-number group worth {n} points.":
    "数字相同、颜色不同的同数组，共 {n} 分。",
  "Consecutive same-colour run worth {n} points.":
    "同色连续的顺子，共 {n} 分。",
  "Add {n} more tile{s}: a group or run needs at least three.":
    "还需要 {n} 张牌：同数组或顺子至少要 3 张。",
  "This group repeats {color}. Use one tile of each colour, up to four.":
    "这个同数组的{color}重复了。每种颜色只能有一张，最多 4 张。",
  "A group has three or four matching numbers in different colours.":
    "同数组需要 3 张或 4 张数字相同、颜色各不相同的牌。",
  "A run cannot repeat a number. Return the duplicate or use it in a different group or run.":
    "顺子不能有重复数字。请收回多余的牌，或把它用在别的牌组里。",
  "This run is missing {numbers}. Fill the gap with the same colour or a joker; 13 never wraps to 1.":
    "这个顺子缺少 {numbers}。请用同色牌或万能牌补齐；13 后面不能接 1。",
  "Choose either matching numbers in different colours, or consecutive numbers in one colour. Split these tiles into separate groups or runs.":
    "请组成数字相同、颜色不同的同数组，或同色连续的顺子。可以把这些牌拆成几个牌组。",
  "Wait for your turn to request a move.": "请等轮到你时，再查看出牌提示。",
  "Fix the incomplete table first. {reason} Your edits are unchanged.":
    "请先补齐桌上的牌组。{reason} 当前摆牌没有改变。",
  "Your table is valid and you played from your rack. You can End turn now, or keep playing.":
    "桌上的牌组都符合规则，而且你已出了手牌。现在可以点“结束回合”，也可以继续出牌。",
  "No legal addition was found in this search. {action}; unfinished edits will be reset.":
    "这次没有找到合适的接牌方法。{action}，未完成的摆牌会撤回。",
  "You can draw": "你可以摸一张牌",
  "The pool is empty; you can pass": "已经没有牌可摸，你可以点“跳过”",
  "No opening reaching 30 points was found. {action}. Your current opening is worth {n} points.":
    "这次没有找到达到 30 分的首次出牌组合。{action}。当前首次出牌共 {n} 分。",
  "You can draw and try on your next turn": "你可以摸一张牌，下回合再试",
  "Group: {n} tiles showing {value}, each with a different colour.":
    "同数组：{n} 张牌的数字都是 {value}，颜色各不相同。",
  "Run: {color} {numbers}, consecutive without gaps.":
    "顺子：{color} {numbers}，数字连续，没有缺号。",
  "You have already opened, so there is no minimum point total this turn.":
    "你已完成开局，本回合不再要求最低分数。",
  "Opening total: {n} points, meeting the 30-point requirement.":
    "首次出牌共 {n} 分，达到至少 30 分的要求。",
  "Possible move: play {n} highlighted tile{s}{opening}. Review it, then choose Place hint if you want to use it. Your turn will not end automatically.":
    "可以试试出这 {n} 张亮起的牌{opening}。看过后，如想采用，请点“按提示摆牌”。回合不会自动结束。",
  "for an opening worth {n} points": "，首次出牌共 {n} 分",
  "draw a tile": "摸一张牌",
  "The planner could not finish. Try again or {action}.":
    "出牌提示未能完成。可以重试，或{action}。",
  "The planner could not start. Try again or {action}.":
    "出牌提示未能启动。可以重试，或{action}。",
  "Planning is unavailable. You can still {action}.":
    "暂时无法提供出牌提示。你仍然可以{action}。",
  "Planning took too long. Try again or {action}.":
    "寻找出牌方法用时太长。可以重试，或{action}。",
};
export default messages;
