import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row, ToggleButton } from "react-bootstrap";
import { formatDataForHourlyChart, getEarliestDate, getLastDate, IChartPoint, IDonation } from "../data/DataHelper";
import { useSelector } from "react-redux";
import { store } from "../../app/store";
import {
	Bar,
	Legend,
	Line,
	Tooltip,
	XAxis,
	YAxis,
	ComposedChart,
	CartesianGrid
} from "recharts";
import DatePicker from 'react-date-picker';
import { Switch } from "antd";

enum AccountTypes {
	USER = "user",
	NON_USER = "non-user",
}

function DonorChart() {
	const [donations, setDonations] = useState<IDonation[]>([]);
	const [minTime, setMinTime] = useState<Date>(new Date(1984, 1,1,1,1,0,0));
	const [maxTime, setMaxTime] = useState<Date>(new Date(2024, 1,1,1,1,0,0));
	const [chartPoints, setChartPoints] = useState<IChartPoint[]>([]);
	const [shownSubscriberTypes, setshownSubscriberTypes] = useState<boolean[]>([true, false]);
	const [shownAcctTypes, setshowAncctTypes] = useState<string[]>([AccountTypes.USER, AccountTypes.NON_USER]);
	const [filteredPoints, setFilteredPoints] = useState<IChartPoint[]>([]);
	const [showSub, setShowSub] = useState<boolean>(true);
	const [showNotSub, setShowNotSub] = useState<boolean>(true);
	const [showAcct, setShowAcct] = useState<boolean>(true);
	const [showNotAcct, setShowNotAcct] = useState<boolean>(true);
	const donationStoreSate = useSelector(state => store.getState().donations);

	const prevDonationsRef = useRef<IDonation[]>();

	useEffect(() => {
		console.log('effect 1');
		const donationsInStore = donationStoreSate.value;
		if(donationsInStore != prevDonationsRef.current) {
			console.log('effect 1: INSIDE IF');
			console.log('first date:');
			console.log(getEarliestDate(donationsInStore));
			console.log('last date:')
			console.log(getLastDate(donationsInStore));
			setMinTime(getEarliestDate(donationsInStore));
			setMaxTime(getLastDate(donationsInStore));
			setDonations(donationsInStore);
		}
		prevDonationsRef.current = donationsInStore;
	});

	useEffect(() => {
		console.log('effect 2');
		if(donations.length > 0){
			console.log('effect 2: INSIDE IF');
			const filteredData = applyFilters(donations);
			if (filteredData.length > 0){
				const points = formatDataForHourlyChart(filteredData, minTime, maxTime);
				setChartPoints(points);
			}
		}
	}, [minTime, maxTime, donations, shownAcctTypes, shownSubscriberTypes, showNotAcct, showAcct, showNotSub, showSub]);


	function applyFilters(donationsToFilter: IDonation[]): IDonation[] {
		let subscriptionFilter: boolean[] = [];
		if (showSub) subscriptionFilter.push(true);
		if (showNotSub) subscriptionFilter.push(false);
		let accountFilter: boolean[] = [];
		if (showAcct) accountFilter.push(true);
		if (showNotAcct) accountFilter.push(false);
		const filteredByDateWindow = donationsToFilter.filter(item => {
			if (item.created_at >= minTime && item.created_at <= maxTime){
				return true;
			} else {
				return false;
			}
		});
		const filteredBySubscriptions = filteredByDateWindow.filter(item => {
			if(subscriptionFilter.includes(item.subscription)){
				return true;
			} else {
				return false;
			}
		});
		const filteredByAcct = filteredBySubscriptions.filter(item => {
			if(accountFilter.includes(item.account_is_user)) {
				return true;
			} else {
				return false;
			}
		});
		return filteredByAcct;
	}

	function toggleSubscribers(checked: any){
		setShowSub(checked);
	}

	function toggleNonSubscribers(checked: any){
		setShowNotSub(checked);
	}

	function toggleAccount(checked: any){
		setShowAcct(checked);
	}

	function toggleNonAccount(checked: any){
		setShowNotAcct(checked);
	}

	const renderChart = () => {
		return (
				<Col>
					<ComposedChart
						width={800}
						height={600}
						data={chartPoints}
						margin={{
							top: 5,
							right: 5,
							bottom: 5,
							left: 5,
						}}
					>
						<CartesianGrid stroke="#f5f5f5" />
						<XAxis dataKey="hour" />
						<YAxis tickFormatter={(value: number) => new Intl.NumberFormat('en', {style: 'currency', currency: 'USD', maximumFractionDigits: 0}).format(value)}/>
						<Tooltip formatter={(value: number) => new Intl.NumberFormat('en', {style: 'currency', currency: 'USD'}).format(value)} />
						<Legend layout="vertical" verticalAlign="top" align="center" />
						<Bar dataKey="user_subscription" barSize={30} stackId={"a"} fill="#30cb00" />
						<Bar dataKey="nonUser_subscription" barSize={30} stackId={"a"} fill="#4ae54a" />
						<Bar dataKey="user_notSubcription" barSize={30} stackId={"a"} fill="#ffcc9d" />
						<Bar dataKey="nonUser_notSubscription" barSize={30} stackId={"a"} fill="#ffa29d" />
						<Line type="monotone" dataKey="runningTotal" stroke="black" />
					</ComposedChart>
				</Col>
			)
	}

	return (
		<div className={"DonorChart"}>
			<h1>Chart</h1>
			<Row>
				{renderChart()}
				<Col>
					<h5>Chart Filters</h5>
					<Container>
						<Col>
							<Row>
								<Col>Subscribers</Col>
								<Col>
									<Container>
										<Switch title={'Subscribers'} defaultChecked onChange={toggleSubscribers} />
									</Container>
								</Col>
							</Row>
							<Row>
								<Col>Non Subscribers</Col>
								<Col>
									<Container>
										<Switch title={'Non Subscribers'} defaultChecked onChange={toggleNonSubscribers} />
									</Container>
								</Col>
							</Row>
						</Col>
						<Row>
							<Row>
								<Col>Account</Col>
								<Col>
									<Container>
										<Switch title={'Account'} defaultChecked onChange={toggleAccount} />
									</Container>
								</Col>
							</Row>
							<Row>
								<Col>Non Account</Col>
								<Col>
									<Container>
										<Switch title={'Non Account'} defaultChecked onChange={toggleNonAccount} />
									</Container>
								</Col>
							</Row>
						</Row>
						<Row>
							<Col>Start Date:</Col>
							<Col>
								<DatePicker
									onChange={setMinTime}
									value={minTime}
									maxDate={maxTime}
								/>
							</Col>

						</Row>
						<Row>
							<Col>End Date:</Col>
							<Col>
								<DatePicker
									onChange={setMaxTime}
									value={maxTime}
									minDate={minTime}
								/>
							</Col>

						</Row>
					</Container>
				</Col>
			</Row>

		</div>

	);
}

export default DonorChart;