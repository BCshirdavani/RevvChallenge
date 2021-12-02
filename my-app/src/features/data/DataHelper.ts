import axios, { AxiosError, AxiosResponse } from "axios";

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
}

// export async function getDonationsDataFromUrl(url: string): Promise<IDonation[]> {
// 	// const { REACT_APP_DONATIONS_URL } = process.env;
// 	// const url = REACT_APP_DONATIONS_URL?.toString();
// 	axios.get(url)
// 	.then((response: AxiosResponse) => {
// 		const cleanDonations: IDonation[] = formatDonationsData(response.data);
// 		console.log('printing clean data from get request...');
// 		console.log(cleanDonations);
// 		return cleanDonations;
// 	}).catch((error: AxiosError) => {
// 		console.log(error.message);
// 	});
// }

export function getFakeDonationData() {
	const don1: IDonation = {
		account_type: "subscription",
		address: "521 123  s6d fasd f",
		amount: 2030,
		city: "redmond",
		created_at: new Date(),
		email: "shmee",
		first_name: "beau",
		id: "010101010",
		last_name: "shirdavani",
		organization: "docusign",
		postal_code: "98053",
		state: "wa",
		subscription: false
	};
	const don2: IDonation = {
		account_type: "subscription",
		address: "xxx 123  s6d fasd f",
		amount: 202530,
		city: "redmond",
		created_at: new Date(),
		email: "smitlap@gmaill.com",
		first_name: "travis",
		id: "010101010",
		last_name: "ranch",
		organization: "docusign",
		postal_code: "99940",
		state: "wa",
		subscription: false
	};
	return [don1, don2];
}

export function formatDonationsData(donations: any[]): IDonation[] {
	let formattedDonations: IDonation[] = [];
	donations.forEach((row: any) => {
		const newRow: IDonation = {
			account_type: row.account_type,
			address: row.address,
			amount: row.amount,
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
		};
		formattedDonations.push(newRow);
	});
	return formattedDonations;
}





