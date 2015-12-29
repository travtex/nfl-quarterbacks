
function StatsBlock() {
	this.Att = 0;
	this.Cmp = 0;
	this.Sack = 0;
	this.Int = 0;
	this.PsYds = 0;
	this.PsTD = 0;
	this.Rush = 0;
	this.RshYds = 0;
	this.RshTD = 0;
};

new Vue({
	el: 'body',
	data: {
		players: [
			{id: 1870523, text: 'Tom Brady'},
			{id: 1949528, text: 'Tony Romo'},
			{id: 2223207, text: 'Andy Dalton'}
		],
		playerStats: {},
		playerName: '',
		playerID: '',
		playerImg: '',
		playerTeam: '',
		playerTeamImg: '',
		seasonYears: [],
		totalStats: {},
		seasonStats: {}
	},

	methods: {
		toggleMenu: function(e) {
			e.preventDefault();
			$("#wrapper").toggleClass("toggled");
		},

		getPlayerData: function(player) {
			var vm = this;
			$.ajax({
				type: 'GET',
				dataType: 'json',
				url: 'assets/json/nfl-'+player+'.json',
				success: function(data) {
					vm.playerStats = data;
					vm.processPlayerData();
				}
			});
		},

		processPlayerData: function() {
			this.playerName = this.playerStats.rows[0][1];
			this.playerID = this.playerStats.rows[0][0];
			this.playerImg = this.playerStats.rows[0][2];
			this.playerTeam = this.playerStats.rows[0][6];
			this.playerTeamImg = this.playerStats.rows[0][7];
			var years = [];
			for(var i = 0; i < this.playerStats.rows.length; i++) {
				var row = this.playerStats.rows[i];
				years.push(row[3]);
			}
			this.seasonYears = _.uniq(years);
			this.getTotalStats();
			$('a[href="#totals"').tab('show');
		},

		getSeasonStats: function(season) {

			var seasonStats = new StatsBlock();
			var ypaChartData = [];
			var cmpChartData = [];
			var team = "";

			for(var i = 0; i < this.playerStats.rows.length; i++) {
				var row = this.playerStats.rows[i];
				if(row[3] === season) {
					seasonStats.Att += row[10];
					seasonStats.Cmp += row[11];
					seasonStats.Sack += row[12];
					seasonStats.Int += row[13];
					seasonStats.PsYds += row[14];
					seasonStats.PsTD += row[15];
					seasonStats.Rush += row[16];
					seasonStats.RshYds += row[17];
					seasonStats.RshTD += row[18];
					
					if (parseFloat((row[14]/row[10]).toFixed(1)) >= 0) {
						ypaChartData.push([row[5], parseFloat((row[14]/row[10]).toFixed(1))]);
					} else {
						ypaChartData.push([row[5], null]);
					}

					if(parseFloat(((row[11]/row[10])*100).toFixed(1)) >= 0) {
						cmpChartData.push([row[5], parseFloat(((row[11]/row[10])*100).toFixed(1))]);
					} else {
						cmpChartData.push([row[5], null]);
					}

					team = row[6];
				}
			}
			this.seasonStats = seasonStats;

			this.buildCharts(ypaChartData, cmpChartData, team);
		},

		getTotalStats: function() {
			var totalStats = new StatsBlock();
			var ypaChartData = [];
			var cmpChartData = [];
			var team = "";

			for(var i = 0; i < this.playerStats.rows.length; i++) {
				var row = this.playerStats.rows[i];
				totalStats.Att += row[10];
				totalStats.Cmp += row[11];
				totalStats.Sack += row[12];
				totalStats.Int += row[13];
				totalStats.PsYds += row[14];
				totalStats.PsTD += row[15];
				totalStats.Rush += row[16];
				totalStats.RshYds += row[17];
				totalStats.RshTD += row[18];

				var ypaData = {
					x: Date.parse(row[5]),
					y: null,
					year: row[3],
					week: row[4],
					game: {
						team: row[6],
						teamImg: row[7],
						opp: row[8],
						oppImg: row[9]
					},
					stats: {
						Att: row[10],
						Cmp: row[11],
						Sack: row[12],
						Int: row[13],
						PsYds: row[14],
						PsTD: row[15],
						Rush: row[16],
						RshYds: row[17],
						RshTD: row[18]
					},
					name: "Week " + row[4] + ", " + row[3]
				};

				if(parseFloat((row[14]/row[10]).toFixed(1)) >= 0 ) {
					ypaData.y = parseFloat((row[14]/row[10]).toFixed(1));
				}

				ypaChartData.push(ypaData); 

				var cmpData = {
					x: Date.parse(row[5]),
					y: null,
					year: row[3],
					week: row[4],
					game: {
						team: row[6],
						teamImg: row[7],
						opp: row[8],
						oppImg: row[9]
					},
					stats: {
						Att: row[10],
						Cmp: row[11],
						Sack: row[12],
						Int: row[13],
						PsYds: row[14],
						PsTD: row[15],
						Rush: row[16],
						RshYds: row[17],
						RshTD: row[18]
					},
					name: "Week " + row[4] + ", " + row[3]
				};

				if(parseFloat(((row[11]/row[10])*100).toFixed(1)) >= 0) {
					cmpData.y = parseFloat(((row[11]/row[10])*100).toFixed(1));
				}
				cmpChartData.push(cmpData); 
				team = row[6];
			}

			this.totalStats = totalStats;
			// Build Charts
			this.buildCharts(ypaChartData, cmpChartData, team);
		},

		buildCharts: function(ypa, cmp, team) {
			// Build Charts
			var primary = '';
			var secondary = '';

			console.log(ypa);

			switch(team) {
				case 'CIN':
					primary = "#FB4F14";
					secondary = "#FFFFFF";
					break;
				case 'DAL':
					primary = "#0D254C";
					secondary = "#C5CED6";
					break;
				case 'NE':
					primary = "#0D254C";
					secondary = "#D6D6D6";
					break;
				default:
					primary = "#7CB5EC";
					secondary = "#EFEFEF";
			}

			$('#yards-per-attempt').highcharts({
		        chart: {
		            type: 'spline',
		            plotBackgroundColor: {
		            	linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
					    stops: [
					        [0, secondary],
					        [1, primary],
					    ]
		            },
		            plotBorderColor: secondary,
		            plotBorderWidth: 2,
		            borderColor: primary,
		            borderWidth: 2,
		            className: team,
		            renderTo: 'yards-per-attempt'
		        },
		        credits: {
		        	href: "https://github.com/travtex",
		        	text: "Hire This Guy"
		        },
		        title: {
		            text: 'Yards per Attempt'
		        },
		        xAxis: {
		       		type: 'date'
		        },
		        yAxis: {
		            title: {
		                text: 'Yards per Attempt'
		            }
		        },
		        series: [{
		            name: 'YPA',
		            data: ypa,
		            color: secondary,
		            dashStyle: "ShortDashDotDot"
		        }]
		    });

		    $('#completion-percentage').highcharts({
		        chart: {
		            type: 'spline',
		        },
		        title: {
		            text: 'Completion Percentage'
		        },
		        xAxis: {
		        	type: 'date'
		        },
		        yAxis: {
		            title: {
		                text: 'Completion %'
		            }
		        },
		        series: [{
		            name: 'CMP%',
		            data: cmp
		        }]
		    });
		}
	},

	components: {
		
	},

	ready: function() {

	},
});