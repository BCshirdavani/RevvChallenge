import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row } from "react-bootstrap";
import { formatDataForHourlyChart, IChartPoint, IDonation } from "../data/DataHelper";
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
	}, [minTime, maxTime, donations, shownAcctTypes, shownSubscriberTypes]);


	function applyFilters(donationsToFilter: IDonation[]): IDonation[] {
		const filtered = donationsToFilter.filter(value => {
			return (
				shownAcctTypes.includes(value.account_type) &&
				shownSubscriberTypes.includes(value.subscription) &&
				value.created_at >= minTime &&
				value.created_at <= maxTime
			);
		});
		return filtered;
	}

	const renderChart = () => {

		return (
			<Row>
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
				<Col>
					<h3>filters</h3>
					<Container>
						<Col>
							<Row>
								<Button>Sub</Button>
								<Button>Non Sub</Button>
							</Row>
						</Col>
						<Row>
							<Button>Account</Button>
							<Button>Non Account</Button>
						</Row>
						<Row>
							<DatePicker
								onChange={setMinTime}
								value={minTime}
								maxDate={maxTime}
							/>
						</Row>
						<Row>
							<DatePicker
								onChange={setMaxTime}
								value={maxTime}
								minDate={minTime}
							/>
						</Row>
					</Container>

				</Col>
			</Row>

			)
	}


	return (
		<div className={"DonorChart"}>
			<h1>Chart</h1>
			{console.log('chart render RETURN')}
			{chartPoints.length > 0 ? renderChart() : null}
		</div>

	);
}

export default DonorChart;