import fakeData from "./FakeData.json";
import statesList from "./States.json";

export interface IDonation {
	id: string,
	first_name: string,
	last_name: string,
	email: string,
	organization: string,
	amount: number,
	created_at: Date,
	address: string,
	city: string,
	state: string,
	postal_code: string,
	subscription: boolean,
	account_type: string,
	account_is_user: boolean,
}

export interface IChartPoint {
	index: number,
	date: Date,
	hour: string,
	user_subscription: number,
	nonUser_subscription: number,
	user_notSubcription: number,
	nonUser_notSubscription: number,
	runningTotal: number,
}

export interface IMapPoint {
	state: string,
	dollars: number,
	stateAbreviated: string,
}

export function groupDollarsByState(donations: IDonation[]): IMapPoint[] {
	let mapData: Map<string, IMapPoint> = new Map<string, IMapPoint>();
	const statesListMap: Map<string, string> = new Map(Object.entries(statesList));
	statesListMap.forEach((value, key) => {
		const newState: IMapPoint = {
			dollars: 0, state: value, stateAbreviated: key
		};
		mapData.set(key, newState);
	});
	donations.forEach(value => {
		const oldAmount = mapData.get(value.state) != null ? mapData.get(value.state)!.dollars : 0;
		const updatedMapPoint: IMapPoint = {
			state: statesListMap.get(value.state)!,
			dollars: oldAmount + value.amount,
			stateAbreviated: value.state,
		};
			mapData.set(value.state, updatedMapPoint);
	});
	const groupedStateDolalrs = Array.from(mapData.values());
	return groupedStateDolalrs;
}

// parses json to fit IDonation type
export function formatDonationsData(donations: any[]): IDonation[] {
	let formattedDonations: IDonation[] = [];
	donations.forEach((row: any) => {
		const newRow: IDonation = {
			account_type: row.account_type,
			address: row.address,
			amount: row.amount / 100,
			city: row.city,
			created_at: new Date(row.created_at * 1000),
			email: row.email,
			first_name: row.first_name,
			id: row.id,
			last_name: row.last_name,
			organization: row.organization,
			postal_code: row.postal_code,
			state: row.state,
			subscription: row.subscription === "true",
			account_is_user: row.account_type === "user",
		};
		formattedDonations.push(newRow);
	});
	return formattedDonations;
}

// formats the array of donation records, to fit ReCharts api
export 	function formatDataForHourlyChart(rawData: IDonation[], startFilter: Date, endFilter: Date): IChartPoint[] {
	const arrToSort = [...rawData];
	const sortedArr = arrToSort.sort(timeAescending);
	const donations: number = sortedArr.length;
	const firstDate = sortedArr[0] ? sortedArr[0].created_at : startFilter;
	const lastDate = sortedArr[donations - 1] ? sortedArr[donations - 1].created_at : endFilter;
	let prevDate = new Date(firstDate.toUTCString());
	prevDate.setHours(firstDate.getHours());
	prevDate.setMinutes(0);
	prevDate.setSeconds(0);
	prevDate.setMilliseconds(0);
	let nextDate = new Date(prevDate.toUTCString());
	nextDate.setHours(nextDate.getHours() + 1);
	const hours = Math.ceil(Math.abs(lastDate.valueOf() - firstDate.valueOf()) / 36e5);
	let formattedData: IChartPoint[] = [];
	let hr: number = 0;
	let i: number = 0;
	let cumulativeAmount: number = 0;
	while (hr <= hours && i < donations) {
		if (sortedArr[i].created_at >= prevDate && sortedArr[i].created_at < nextDate) {
			// this donation fits the time bucket
			const newPoint = newChartPointFromRow(sortedArr[i], i, cumulativeAmount, prevDate);
			cumulativeAmount += sortedArr[i].amount;
			if(!formattedData[hr]){
				// make new entry
				formattedData.push(newPoint);
			} else {
				formattedData[hr] = updateExistingEntry(formattedData, hr, sortedArr, i, newPoint);
			}
			i++;
		} else if (sortedArr[i].created_at >= nextDate && !formattedData[hr]) {
			// no data for this time bucket, fill with blank entry and move to next window
			const newPoint = newEmptyChartPoint(prevDate, hr, cumulativeAmount);
			formattedData.push(newPoint);
			hr++;
			prevDate.setHours(prevDate.getHours() + 1);
			nextDate.setHours(nextDate.getHours() + 1);
		} else {
			// entry already has blank data, move to next window
			hr++;
			prevDate.setHours(prevDate.getHours() + 1);
			nextDate.setHours(nextDate.getHours() + 1);
		}
	}
	return formattedData;
}

export function getBiggestDonation(donorRecords: IDonation[]) {
	let arrToSort = [...donorRecords];
	return arrToSort.sort((a, b) => b.amount - a.amount)[0].amount;
}

export function getEarliestDate(donorRecords: IDonation[]) {
	let arrToSort = [...donorRecords];
	return arrToSort.sort(timeAescending)[0].created_at;
}

export function getLastDate(donorRecords: IDonation[]) {
	let arrToSort = [...donorRecords];
	return arrToSort.sort(timeAescending)[donorRecords.length - 1].created_at;
}

// used for dev/testing
export function getFakeDonationData(): IDonation[] {
	return formatDonationsData(fakeData);
}

function updateExistingEntry(formattedData: IChartPoint[], hr: number, sortedArr: IDonation[], i: number, newPoint: IChartPoint) {
	const nonUser_notSub = (!sortedArr[i].subscription && sortedArr[i].account_type !== "user") ? sortedArr[i].amount : 0;
	const nonUser_sub = (sortedArr[i].subscription && sortedArr[i].account_type !== "user") ? sortedArr[i].amount : 0;
	const user_notSub = (!sortedArr[i].subscription && sortedArr[i].account_type === "user") ? sortedArr[i].amount : 0;
	const user_sub = (sortedArr[i].subscription && sortedArr[i].account_type === "user") ? sortedArr[i].amount : 0;
	let updatedEntry = {
		...formattedData[hr],
		nonUser_subscription: formattedData[hr].nonUser_subscription + nonUser_sub,
		nonUser_notSubscription: formattedData[hr].nonUser_notSubscription + nonUser_notSub,
		user_subscription: formattedData[hr].user_subscription + user_sub,
		user_notSubcription: formattedData[hr].user_notSubcription + user_notSub,
		runningTotal: newPoint.runningTotal,
	};
	return updatedEntry;
}

// creates chart data point from donation record
function newChartPointFromRow(row: IDonation, i: number, oldTotal: number, dateBucket: Date): IChartPoint {
	const nonUser_notSub = (!row.subscription && row.account_type !== "user") ? row.amount : 0;
	const nonUser_sub = (row.subscription && row.account_type !== "user") ? row.amount : 0;
	const user_notSub = (!row.subscription && row.account_type === "user") ? row.amount : 0;
	const user_sub = (row.subscription && row.account_type === "user") ? row.amount : 0;
	const newPoint: IChartPoint = {
		date: new Date(dateBucket),
		hour: dateBucket.toLocaleDateString() + " " + dateBucket.toLocaleTimeString(),
		index: i,
		nonUser_notSubscription: nonUser_notSub,
		nonUser_subscription: nonUser_sub,
		runningTotal: row.amount + oldTotal,
		user_notSubcription: user_notSub,
		user_subscription: user_sub,
	};
	return newPoint;
}

// creates chat data point, with no donation record
function newEmptyChartPoint(dateBucket: Date,i: number, oldTotal: number): IChartPoint {
	const newPoint: IChartPoint = {
		date: new Date(dateBucket),
		hour: dateBucket.toLocaleDateString() + " " + dateBucket.toLocaleTimeString(),
		index: i,
		nonUser_notSubscription: 0,
		nonUser_subscription: 0,
		runningTotal: oldTotal,
		user_notSubcription: 0,
		user_subscription: 0
	};
	return newPoint;
}

function timeAescending( a: IDonation, b: IDonation ) {
	if ( a.created_at < b.created_at ){
		return -1;
	}
	if ( a.created_at > b.created_at ){
		return 1;
	}
	return 0;
}




