import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Table } from "react-bootstrap";
import { IDonation } from "../data/DataHelper";
import { useSelector } from "react-redux";
import { store } from "../../app/store";
import './DonorTable.css';


function DonorTable(): JSX.Element {
	const [sortDescending, setSortDescending] = useState<boolean>(true);
	const [donations, setDonations] = useState<IDonation[]>([]);
	const donationStoreSate = useSelector(state => store.getState().donations);

	const prevDonationsRef = useRef<IDonation[]>();

	useEffect(() => {
		const donationsInStore = donationStoreSate.value;
		if(donationsInStore !== prevDonationsRef.current) {
			setDonations(donationsInStore);
		}
		prevDonationsRef.current = donationsInStore;
	}, [donationStoreSate.value]);

	function renderTableRows() {
		if (donations.length > 0) {
			const arrayForSort = [...donations]
			const tableData = sortDescending ? arrayForSort.sort(descendingComp) : arrayForSort.sort(asscendingComp);
			return (
				<tbody>
				{tableData.map((row) =>
					<tr key={row.id}>
						<td>{row.amount.toLocaleString('US', { style: 'currency', currency: 'USD' })}</td>
						<td>{row.last_name}</td>
						<td>{row.first_name}</td>
						<td>{row.created_at.toLocaleDateString() + " " + row.created_at.toLocaleTimeString()}</td>
						<td>{row.city}</td>
						<td>{row.state}</td>
						<td>{row.postal_code}</td>
						<td>{row.email}</td>
						<td>{row.subscription ? "yes" : "no"}</td>
						<td>{row.account_type}</td>
					</tr>
				)}
				</tbody>
			);
		}
	}

	function descendingComp( a: IDonation, b: IDonation ) {
		if ( a.amount < b.amount ){
			return 1;
		}
		if ( a.amount > b.amount ){
			return -1;
		}
		return 0;
	}

	function asscendingComp( a: IDonation, b: IDonation ) {
		if ( a.amount < b.amount ){
			return -1;
		}
		if ( a.amount > b.amount ){
			return 1;
		}
		return 0;
	}
	
	function toggleSort() {
		setSortDescending(!sortDescending);
	}

	return (
		<Container className={"DonorTable"}>
			<h3>List of All Donors</h3>
			<div>
				<Button color={"primary"} onClick={() => {toggleSort()}}>Toggle Sort By Amount</Button>
			</div>
			<Table className={"Table"}>
				<thead>
					<tr>
						<th>Amount</th>
						<th>Last Name</th>
						<th>First Name</th>
						<th>Date</th>
						<th>City</th>
						<th>State</th>
						<th>Zip</th>
						<th>Email</th>
						<th>Subscriber</th>
						<th>Account Type</th>
					</tr>
				</thead>
				{renderTableRows()}
			</Table>
		</Container>
	)
}

export default DonorTable;