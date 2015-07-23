// This script checks the bus checks bus 55 incoming time 
// and play via the speaker attached

// Dependencies:
// 	Later - for scheduling
//  child_process - for calling shell script
//	request - for serving API

var later = require('later');
later.date.localTime();
var busCheckingSched = later.parse.text('at 07:40am every weekday');
// var busCheckingSched = later.parse.text('every 2 min');
var request = require('request');
var AccountKey = 'LzlWwpSJtvxbqa2cbiV6oQ==';
var UniqueUserID = '4764dbec-cbb4-46f9-b611-ede559faf0c7';

var moment = require('moment');

var child_process = require('child_process');

var busTimer = later.setInterval(checkBus, busCheckingSched);
//checkBus();
var flag_reset = false;

function checkBus (){
	var service_id = 55;
	console.log('Checking bus %d timing', service_id);
	var options = {
		url: 'http://datamall2.mytransport.sg/ltaodataservice/BusArrival?BusStopID=92079&ServiceNo='+service_id,
		headers: {
			'AccountKey': AccountKey,
			'UniqueUserId': UniqueUserID,
			'accept':'application/json'
		}
	};
	// console.log('request options: ')
	// console.log(options)
	request(options, function(error, response, body){
		if(!error && response.statusCode == 200){
			var info = JSON.parse(body);
			var service = info['Services'][0]
			// console.log(service);
			var report = {
				'status': service['Status'],
				'incoming': Math.ceil((moment(service['NextBus']['EstimatedArrival']).unix() - moment().unix())/60),
				'following': Math.ceil((moment(service['SubsequentBus']['EstimatedArrival']).unix() - moment().unix())/60)
			};
			var sentence = 'Good Morning, Bus '+service_id+' is '+report['status']+' and arriving in '+report['incoming']+' minutes. Next one is '+report['following']+' minutes away';
			child_process.execFile('./speech.sh', [sentence], function(error, stdout, stderr){
				console.log('stdout: '+stdout);
				// console.log('stderr: '+ stderr);
				if(!flag_reset){
					flag_reset = true;
					var butTimerSnooze = setTimeout(function(){
						checkBus();
					}, 15*60*1000)
					if (error != null){
						console.log('exec error: '+ error)
					}					
				}else{
					flag_reset = false;
				}
			});
			console.log(sentence);
		}else{
			console.log('request error')
		}
	});
}
