import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import fakeData from './FakeData.json';
import { formatDonationsData } from "./DataHelper";
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

