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
	CartesianGrid, ResponsiveContainer
} from "recharts";
import DatePicker from 'react-date-picker';
import { Switch } from "antd";
import './Chart.css';

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
			const points = formatDataForHourlyChart(filteredData, minTime, maxTime);
			setChartPoints(points);
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

	const renderCategoryFilter = (description: string, onChange: (checked: any) => void) => {
		return (
			<Row>
				<Col className={'FilterItem'}>{description}</Col>
				<Col>
					<Container className={'FilterItem'}>
						<Switch title={description} defaultChecked onChange={onChange} />
					</Container>
				</Col>
			</Row>
		)
	}

	const renderDateFilter = (
		description: string,
		onChange: React.Dispatch<React.SetStateAction<Date>>,
		val: Date,
		dateCutoff: Date,
		hasCeiling: boolean
		) => {
		if (hasCeiling) {
			// set calendar ceiling
			return (
				<Row>
					<Col className={'FilterItem'}>{description}</Col>
					<Col className={'FilterItem'}>
						<DatePicker
							onChange={onChange}
							value={val}
							maxDate={dateCutoff}
						/>
					</Col>
				</Row>
			)
		} else {
			// set calendar floor
			return (
				<Row>
					<Col className={'FilterItem'}>{description}</Col>
					<Col className={'FilterItem'}>
						<DatePicker
							onChange={onChange}
							value={val}
							minDate={dateCutoff}
						/>
					</Col>
				</Row>
			)
		}
	}

	const renderChart = () => {
		return (
				<Col xs={12} md={8}>
					<ResponsiveContainer height={600} width={"100%"}>
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
							<Line type="monotone" dataKey="runningTotal" stroke="gray" />
						</ComposedChart>
					</ResponsiveContainer>
				</Col>
			)
	}

	return (
		<Container className={"DonorChart"}>
			<h3>Chart</h3>
			<Row>
				{renderChart()}
				<Col xs={6} md={4}>
					<Container className={'FilterArea'}>
						<h5>Chart Filters</h5>
						<Container>
							{renderCategoryFilter('Subscribers', toggleSubscribers)}
							{renderCategoryFilter('Non Subscribers', toggleNonSubscribers)}
							{renderCategoryFilter('Account', toggleAccount)}
							{renderCategoryFilter('Non Account', toggleNonAccount)}
							{renderDateFilter('Start Date', setMinTime, minTime, maxTime, true)}
							{renderDateFilter('End Date', setMaxTime, maxTime, minTime, false)}
						</Container>
					</Container>
				</Col>
			</Row>
		</Container>

	);
}

export default DonorChart;