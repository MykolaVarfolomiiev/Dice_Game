                    INSTRUCTIONS:
                    
Open the game folder in VS Code IDE.

Open build in terminal (press Ctrl + `).

To be able to play this game you have to have node + npm installed (to check if you have it installed run: npm -v node -v)

If you do not have it installed, complete instructions below:

Download the installer: Go to the official Node.js website and download the LTS (Long-Term Support) version for youroperating system (Windows, macOS, or Linux).
Run the installer: Open the downloaded file and follow the setup wizard prompts.
Ensure defaults are selected: Make sure the option to include the npm package manager is selected, which is typically the default.
Complete the installation: Click "Install" and then "Finish" when done. 

If you have node and npm installed, run these commands:

npm init -y
npm i 
npm i express xss socket.io     ( if it doesn't work run them separately: npm i express, npm i xss, ...)

To run the game:
npm run dev

After you have done everything listed above:

Open the game page in a browser use this link:
http://localhost:3000

~ GAME RULES ~

To start the game, you are required to enter your name and press the "Join Game" button.

You will see a countdown timer - this is the time you have to make your guess for the sum of two dice
for the NEXT ROUND.

Choose a number between 2 and 12 from the dropdown list above the card/field that displays your name 
and statistics.

Press the "My Guess" button every time you want to join the current round. The status indicator will 
change from grey to green, and the status will update to "Joined this round" status update, indicating 
that you have joined the current round.

You can change your guess sum at any point during the round while the timer is running

After the round ends (the timer runs out), your personal statistics will show whether you won or lost 
the round. The "Wins" count increases only if you guessed correctly; otherwise, only the "Total rounds" 
count increases.

The next round starts automatically, and the timer begins counting down again. You must quickly make 
your next guess and join the round, or you can choose to do nothing and watch other players.

You can leave the game at any time by pressing the "Leave Game" button.
