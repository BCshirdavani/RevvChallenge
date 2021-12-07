import React, { useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from "react-bootstrap";
import {
	formatDataForHourlyChart, getBiggestDonation,
	getEarliestDate,
	getLastDate, groupDollarsByState,
	IChartPoint,
	IDonation,
	IMapPoint
} from "../data/DataHelper";
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
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import geoUrl from "./Map.json";

function DonorChart(): JSX.Element {
	const [donations, setDonations] = useState<IDonation[]>([]);
	const [minTime, setMinTime] = useState<Date>(new Date(1984, 1,1,1,1,0,0));
	const [maxTime, setMaxTime] = useState<Date>(new Date(2024, 1,1,1,1,0,0));
	const [chartPoints, setChartPoints] = useState<IChartPoint[]>([]);
	const [mapPoints, setMapPoints] = useState<IMapPoint[]>([]);
	const [showSub, setShowSub] = useState<boolean>(true);
	const [showNotSub, setShowNotSub] = useState<boolean>(true);
	const [showAcct, setShowAcct] = useState<boolean>(true);
	const [showNotAcct, setShowNotAcct] = useState<boolean>(true);
	const [biggestDonation, setBiggestDonation] = useState<number>(100);
	const donationStoreSate = useSelector(state => store.getState().donations);

	const prevDonationsRef = useRef<IDonation[]>();

	useEffect(() => {
		const donationsInStore = donationStoreSate.value;
		if(donationsInStore !== prevDonationsRef.current) {
			setMinTime(getEarliestDate(donationsInStore));
			setMaxTime(getLastDate(donationsInStore));
			setDonations(donationsInStore);
			if(donations.length > 1){
				setBiggestDonation(getBiggestDonation(donations));
			}
		}
		prevDonationsRef.current = donationsInStore;
	}, [donationStoreSate.value, donations]);

	useEffect(() => {
		if(donations.length > 0){
			const filteredData = applyFilters(donations);
			if(filteredData.length > 1){
				setBiggestDonation(getBiggestDonation(filteredData));
			}
			const points = formatDataForHourlyChart(filteredData, minTime, maxTime);
			setChartPoints(points);
			setMapPoints(groupDollarsByState(filteredData));
		}
	}, [minTime, maxTime, donations, showNotAcct, showAcct, showNotSub, showSub]);

	function colorScale(upperLimit: number, key: number) {
		let scale = scaleQuantize<string, number>()
		.domain([1, upperLimit])
		.range([
			"#ffedea",
			"#ffcec5",
			"#ffad9f",
			"#ff8a75",
			"#ff5533",
			"#e2492d",
			"#be3d26",
			"#9a311f",
			"#782618"
		]);
		return scale(key);
	}

	function applyFilters(donationsToFilter: IDonation[]): IDonation[] {
		let subscriptionFilter: boolean[] = [];
		if (showSub) subscriptionFilter.push(true);
		if (showNotSub) subscriptionFilter.push(false);
		let accountFilter: boolean[] = [];
		if (showAcct) accountFilter.push(true);
		if (showNotAcct) accountFilter.push(false);
		const filteredData = donationsToFilter.filter(item => {
			return item.created_at >= minTime && item.created_at <= maxTime;
		}).filter(item => {
			return subscriptionFilter.includes(item.subscription);
		}).filter(item => {
			return accountFilter.includes(item.account_is_user);
		});
		return filteredData;
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
						<DatePicker className={"DatePicker"}
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
						<DatePicker className={"DatePicker"}
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
				<Container>
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
							<Legend verticalAlign="top" align="center" />
							<Bar dataKey="user_subscription" barSize={30} stackId={"a"} fill="#30cb00" />
							<Bar dataKey="nonUser_subscription" barSize={30} stackId={"a"} fill="#4ae54a" />
							<Bar dataKey="user_notSubcription" barSize={30} stackId={"a"} fill="#ff4f00" />
							<Bar dataKey="nonUser_notSubscription" barSize={30} stackId={"a"} fill="#ffa29d" />
							<Line type="monotone" dataKey="runningTotal" stroke="gray" />
						</ComposedChart>
					</ResponsiveContainer>
				</Container>
			)
	}

	const renderMap = () => {
		const data: IMapPoint[] = mapPoints;
			return (
				<Container className={"DollarStateMap"}>
					<h3>Donations by State</h3>
					<ComposableMap projection="geoAlbersUsa">
						<Geographies geography={geoUrl}>
							{({ geographies }) =>
								geographies.map(geo => {
									const cur = data.find(s => s.state === geo.properties.name);
									return (
										<Geography
											key={geo.rsmKey}
											geography={geo}
											fill={cur && cur.dollars > 0 ? colorScale(biggestDonation, cur.dollars) as string : "#EEE"}
										/>
									);
								})
							}
						</Geographies>
					</ComposableMap>
				</Container>

			)
	}

	return (
		<Container className={"DonorChart"}>
			<h3>Donations by Hour</h3>
			<Row>
				{renderChart()}
			</Row>
			<Row>
				<Container className={'FilterArea'}>
					<h5>Chart Filters</h5>
					<Container>
						<Row>
							<Col>
								{renderCategoryFilter('Subscribers', toggleSubscribers)}
								{renderCategoryFilter('Non Subscribers', toggleNonSubscribers)}
							</Col>
							<Col>
								{renderCategoryFilter('Account', toggleAccount)}
								{renderCategoryFilter('Non Account', toggleNonAccount)}
							</Col>
							<Col>
								{renderDateFilter('Start Date', setMinTime, minTime, maxTime, true)}
								{renderDateFilter('End Date', setMaxTime, maxTime, minTime, false)}
							</Col>
						</Row>
					</Container>
				</Container>
			</Row>
			<Row>
				{renderMap()}
			</Row>
		</Container>

	);
}

export default DonorChart;