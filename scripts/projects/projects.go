package projects

import "html/template"

type project struct {
	Id               string
	Name             string
	ShortDescription string
	LongDescription  template.HTML
	SourceCode       string
	Sections         []template.HTML
}

var projects = []project{
	{
		Id:               "stardew-valley-mods",
		Name:             "Stardew Valley mods",
		SourceCode:       "https://github.com/danvolchek/StardewMods",
		ShortDescription: "Modifications for the farming simulator video game",
		LongDescription: `
			<p>
				<a target="_blank" href="https://www.stardewvalley.net/">Stardew Valley</a> is a roleplaying video game where you play as a new farmer starting your very
				first farm. You get to grow crops, raise animals, and build relationships with townsfolk.
			</p>
			<p>
				I love the game. As I played, I had a lot of ideas that would make it even better. Over the course
				of a few years, I created (and maintained, through multiple major game updates) a variety of unofficial
				modifications for the game.
			</p>
			<p>
				Below is a list of all the modifications I&#39;ve made, with personal favorites shown first.
				Most of them are to improve the game, but some are just for fun.
			</p>
			<p>
				My mods have been downloaded a total of <span class="emphasis" data-contents="sdv-total">2.1 million</span> times! Each mod shows how many times it has been downloaded - click to view the download page.
				(Data last updated: <span data-contents="sdv-update-date"></span>)
			</p>`,
		Sections: []template.HTML{`
			<div class="section three-cols">
				<div>Stardew Valley Mods: Favorites</div>
				<div data-contents="sdv-favorites"></div>
			</div>`, `
			<div class="section three-cols">
				<div>Stardew Valley Mods: Other</div>
				<div data-contents="sdv-other"></div>
			</div>`,
		},
	},
	{
		Id:               "personal-website",
		Name:             "This website",
		SourceCode:       "https://github.com/danvolchek/personal-website",
		ShortDescription: "You're looking at it right now",
		LongDescription: `
 			<p>
                I wrote the code for the page you&#39;re reading now. It&#39;s got two parts:
            </p>
            <ul>
                <li>Static HTML, CSS, and JS</li>
                <li>A Golang script to generate new HTML from templates</li>
            </ul>
			<p> The script: </p>
			<ul>
				<li>Generates the projects overview and details sections using a list of projects and descriptions.</li>
				<li>Updates the Stardew Valley mod list (including usage statistics) by dynamically querying the website where I host my Stardew Valley mods.</li>
			</ul>            
			<p>
                The script makes keeping this website up to date with new projects and Stardew Valley mods easy.
            </p>`,
	},
	{
		Id:               "pico-8",
		Name:             "Pico-8",
		SourceCode:       "https://github.com/danvolchek/pico-8",
		ShortDescription: "Games for the retro fantasy console",
		LongDescription: `
 			<p>
                <a target="_blank" href="https://www.lexaloffle.com/pico-8.php">Pico-8</a> is a retro fantasy console. In other words, it's a programming environment that:
            </p>
			<ul>
				<li>replicates the limited hardware capabilities of old game consoles (cpu, ram, screen resolution)</li>
				<li>allows primitive graphics to be drawn easily (lines, circles, etc)</li>
			</ul>
			<p>
                It provides a fun challenge: create video games in a constrained environment. Below is a list of the games, or carts, that I've made.
            </p>`,
		Sections: []template.HTML{`
			<div class="section three-cols">
				<div>Pico 8: Carts</div>
				<div>
					<div>
						<div>Beecells</div>
						<div>Bee themed hexagonal minesweeper</div>
						<div>link pending</div>
					</div>
				</div>
			</div>`,
		},
	},
	{
		Id:               "advent-of-code",
		Name:             "Advent of code",
		SourceCode:       "https://github.com/danvolchek/AdventOfCode",
		ShortDescription: "Solutions to the holiday programming challenges",
		LongDescription: `
 			<p>
                <a target="_blank" href="https://adventofcode.com/">Advent of code</a> is a holiday themed set of 25 programming challenges that release daily on December each year.
            </p>
			<p>
                The quickest completions get shown on a leaderboard each day, and so it's fun to compete to get on the leaderboards.
            </p>
			<p>
                I like to create two solutions for each day: a fast solution to get on leaderboards, and then a slower/cleaned up solution.
            </p>`,
	},
	{
		Id:               "door-unlocker",
		Name:             "Door unlocker",
		SourceCode:       "https://github.com/danvolchek/door-unlocker",
		ShortDescription: "An app + hardware to remotely lock/unlock doors",
		LongDescription: `
 			<p>
                This was a project for a university course on the Internet of Things. I created an Android app  + 3d-printed hardware mount for my apartment front door that allowed it to be opened remotely.
            </p>
			<p>
				I took security into account, ensuring that only pre-approved users would be able to open the door (through pre-shared private keys), and that replay attacks would not be possible (through timestamps). 
			</p>
			<p>
                It was fun and a great introduction to hardware (3d printing, Arduino), but ultimately ended up not being very practical.
            </p>
			<img class="section-image" alt="door-mount" src="https://raw.githubusercontent.com/danvolchek/door-unlocker/master/images/system_image.jpg">`,
	},
}
