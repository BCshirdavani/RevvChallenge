import React, { useEffect, useRef, useState } from 'react';
import { Container, Table } from "react-bootstrap";
import { IDonation } from "../data/DataHelper";
import { useSelector } from "react-redux";
import { store } from "../../app/store";
import './LeaderBoard.css';


function LeaderBoard() {
	const [donations, setDonations] = useState<IDonation[]>([]);
	const donationStoreSate = useSelector(state => store.getState().donations);
	const prevDonationsRef = useRef<IDonation[]>();

	useEffect(() => {
		console.log('effect 1');
		const donationsInStore = donationStoreSate.value;
		if(donationsInStore != prevDonationsRef.current) {
			console.log('effect 1: INSIDE IF');
			setDonations(donationsInStore);
		}
		prevDonationsRef.current = donationsInStore;
	}, [donations]);

	function renderLeaders() {
		if (donations.length > 0) {
			const topN = sortAndFilterTopN(donations, 5);
			return (
				<tbody>
				{topN.map((row, index) =>
					<tr key={index}>
						<td>{row[0]}</td>
						<td>{row[1].toLocaleString('US', { style: 'currency', currency: 'USD' })}</td>
					</tr>
				)}
				</tbody>
			);
		}
	}

	function sortAndFilterTopN(donorRecords: IDonation[], n: number): [string, number][]{
		const arrayForMap = [...donorRecords]
		let donationsByEmail: Map<string, number> = new Map<string, number>();
		arrayForMap.forEach((row) => {
			if(donationsByEmail.has(row.email) && donationsByEmail.get(row.email) != null) {
				donationsByEmail.set(row.email, donationsByEmail.get(row.email)! + row.amount);
			} else {
				donationsByEmail.set(row.email, row.amount);
			}
		});
		const sortedArray = Array.from(donationsByEmail.entries()).sort((a, b) => b[1] - a[1]);
		const topN = [];
		for (let i = 0; (i < n && i < sortedArray.length); i++) {
			topN.push(sortedArray[i]);
		}
		return topN;
	}


	return (
		<Container className={"LeaderBoard"}>
			<h1>LeaderBoard</h1>
			<Table>
				<thead>
				<tr>
					<th>Email</th>
					<th>Amount</th>
				</tr>
				</thead>
				{renderLeaders()}
			</Table>
		</Container>
	);
}

export default LeaderBoard;