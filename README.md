# custom-ai-agent

## Proposal
For my project I'm looking to create an ai agent that can generate different build paths for a player in league of legends based on what happened in the game/what their team, the opponent, and their current build had to offer. I will use Riot Games dev API to retirieve past game data

## Requirements
General
I will be able to enter a players name and see their past game data
I will be able to get information about what that player was using
I will be able to recommend a build path based on information about the game
I will have the option to choose they types of builds recommended to me e.g. Agressive, Defensive, Greedy, etc
I will be able to recommend runes based on user entered informantion in the draft portion of the game
Settings for a players preferences in playstyle
Game data for recommended build, actual build, win or loss, and other player data will be stored on a database
Admin account will be able to look and edit at information for any player

Functions
I will have an autonomous function that runs at varius points in the past game to check it's state and make build recommendations
I will have a function that will update the UI with a list of potential items for the user to have built
I will have an autonomous function that will check which players will most likely be able to be killed with current player build/champion
I will have a user confirmed function that will recommend a build based on the type of build they are looking for (Agressive, Defensive, Greedy)

Additional Tasks
For this project I will be looking to work with images of items and runes to help display information in the application
I would also like to experiment with a 3rd party MCP server
        
New things to do:
Working with a 3rd party MCP server
Working with live game data

## 10 Pages/Views in project
1. Home page
2. Player lookup page
3. Match history page
4. Player preference page
5. Rune recommendation page
6. Game build recommendation
7. Admin page
8. Player analytics page
9. Champion info page
10. Professional players page

# Schedule
### Oct 29

#### Estimates:

Rubric items:
- Toasts/ global alerts
- Global client-side state management
- Error handling

Features:
- Notification when signed in
- Errors displayed to user

#### Delivered

Rubric Items:
- Toasts/ global alerts
- Global client-side state management
- Error handling


Features:
- Errors displayed to user
- Tanstack in place

### Nov 1

#### Estimates:

Rubric items:
- CI/CD pipeline
- Tests run in pipeline (aborts on fail)
- Pipeline linting
- User authentication
- On kubernetes

Features:
- User can sign into page

#### Delivered

Rubric Items:


Features:

### Nov 5

#### Estimates:

Rubric items:
- Network calls read data
- Mobile friendly design

Features:
- Can see a player's past game data including stats, items, KDA, champions, etc
- Can see a player's match history and whether the match was a win or loss
- Can lookup a player and get information about them including winrate, most played champions, rank, etc

#### Delivered

Rubric Items:


Features:

### Nov 8

#### Estimates:

Rubric items:
- Network calls write data
- Authorized page
- Data persisted on server

Features:
- Settings page to choose playstyle

#### Delivered

Rubric Items:


Features:

### Nov 12

#### Estimates:

Rubric items:
- Autonomous agent function
- UI adjustment agent function
- User confirmed agent function
- 3rd party MCP
- agentic loop runs until task is complete/intervention
- output/zod
- Actions persisted to DB

Features:
- Recommended build path using AI based on user stats, champion and item winrate, enemy team build
- Can choose between greedy, defensive, and offensive build paths. Adjusts items based on their cost, defenses, and damage

#### Delivered

Rubric Items:


Features:

### Nov 15

#### Estimates:

Rubric items:
- 2+ reasusable layout components
- 3+ reausable form input components

Features:
- "Record" game information at varius points with recommendation and store in database
- Walk through recorded games to see recommendation

#### Delivered

Rubric Items:


Features:

### Nov 19

#### Estimates:

Rubric items:
- Elements reorder for smaller screens
- Smooth experience

Features:
- Champion information page
- Admin page can see recommended builds and recorded games

#### Delivered

Rubric Items:


Features:

### Nov 22

#### Estimates:

Rubric items:
- 10+ pages or views

Features:
- Page with well known professional player accounts

#### Delivered

Rubric Items:


Features:

### Nov 25

#### Estimates:

Rubric items:
- Autonomous agent function

Features:
- Can see players that can likely be killed with current build

#### Delivered

Rubric Items:


Features:

### Dec 3

#### Estimates:

Rubric items:
- item 1 with description
- item 2 with description

Features:
- feature 4 with description
- feature 5 with description

#### Delivered

Rubric Items:


Features:

### Dec 6
