import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import fakeData from './FakeData.json';
import { formatDonationsData, groupDollarsByState, IMapPoint } from "./DataHelper";
import { IDonation } from "./DataHelper";

test('donations data parses all entries into IDonation array', ()=> {
	const formattedEntries: IDonation[] = formatDonationsData(fakeData);
	const countInput = fakeData.length;
	const countOutput = formattedEntries.length;
	expect(countOutput).toEqual(countInput);
});


test('donations data parses cents to dollars', () => {
	const entry = fakeData[0];
	const cents = entry.amount;
	const formattedEntry = formatDonationsData([entry]);
	const dollars = formattedEntry[0].amount;
	expect(cents).toEqual(dollars * 100);
});

test('dollars by state groups properly', () => {
	const twoDollarWaDonation: IDonation = {
		account_is_user: false,
		account_type: "",
		address: "",
		amount: 2,
		city: "",
		created_at: new Date(),
		email: "",
		first_name: "",
		id: "",
		last_name: "",
		organization: "",
		postal_code: "",
		state: "WA",
		subscription: false
	};
	const threeDollarWaDonation: IDonation = {
		account_is_user: false,
		account_type: "",
		address: "",
		amount: 3,
		city: "",
		created_at: new Date(),
		email: "",
		first_name: "",
		id: "",
		last_name: "",
		organization: "",
		postal_code: "",
		state: "WA",
		subscription: false
	};
	const donations = [twoDollarWaDonation, threeDollarWaDonation];
	const groupedByState = groupDollarsByState(donations);
	const washingtonGroup: IMapPoint | undefined = groupedByState.find((value, index) => {
		if (value.stateAbreviated === 'WA') {
			return value;
		}
	});
	const oregonGroup: IMapPoint | undefined = groupedByState.find((value, index) => {
		if (value.stateAbreviated === 'OR'){
			return value;
		}
	});
	expect(washingtonGroup!.dollars).toEqual(5);
	expect(washingtonGroup!.stateAbreviated).toEqual('WA');
	expect(washingtonGroup!.state).toEqual('Washington');
	expect(oregonGroup!.dollars).toEqual(0);
	expect(oregonGroup!.stateAbreviated).toEqual('OR');
	expect(oregonGroup!.state).toEqual('Oregon');
});



