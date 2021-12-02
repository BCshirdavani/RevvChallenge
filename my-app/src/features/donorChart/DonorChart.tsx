import React, { useEffect, useRef, useState } from 'react';
import { Container } from "react-bootstrap";
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


function DonorChart() {
	const [donations, setDonations] = useState<IDonation[]>([]);
	const [minTime, setMinTime] = useState<Date>(new Date(1984, 1,1,1,1,0,0));
	const [maxTime, setMaxTime] = useState<Date>(new Date(2024, 1,1,1,1,0,0));
	const [chartPoints, setChartPoints] = useState<IChartPoint[]>([]);
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
			const points = formatDataForHourlyChart(donations, minTime, maxTime);
			setChartPoints(points);
		}
	}, [minTime, maxTime, donations]);

	const renderChart = () => {
		return (
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
				<YAxis tickFormatter={(value: number) => new Intl.NumberFormat('en').format(value)}/>
				<Tooltip formatter={(value: number) => new Intl.NumberFormat('en').format(value)} />
				<Legend layout="vertical" verticalAlign="top" align="center" />
				<Bar dataKey="user_subscription" barSize={30} stackId={"a"} fill="#30cb00" />
				<Bar dataKey="nonUser_subscription" barSize={30} stackId={"a"} fill="#4ae54a" />
				<Bar dataKey="user_notSubcription" barSize={30} stackId={"a"} fill="#ffcc9d" />
				<Bar dataKey="nonUser_notSubscription" barSize={30} stackId={"a"} fill="#ffa29d" />
				<Line type="monotone" dataKey="runningTotal" stroke="#ff7300" />
			</ComposedChart>
			)
	}


	return (
		<Container>
			<h1>Chart</h1>
			{console.log('chart render RETURN')}
			{chartPoints.length > 0 ? renderChart() : null}
		</Container>

	);
}

export default DonorChart;