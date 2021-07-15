import {
	faChevronDown,
	faChevronUp,
	faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import "./Table.css";

interface Car {
	id: number;
	mark: string;
	model: string;
	tariffs: {
		[tariff: string]: { year: number };
	};
}

interface Selection {
	model: string;
	mark: string;
	year: number;
}

interface TableData {
	cars: Car[];
	tariffs_list: string[];
}

function Icon({ up }: { up: boolean }) {
	return <FontAwesomeIcon icon={!up ? faChevronUp : faChevronDown} />;
}

function Search({ onSearch }: { onSearch: (filter: string) => void }) {
	const [filter, setFilter] = useState("");
	return (
		<div className="search">
			<div className="search-box">
				<div className="icon">
					<FontAwesomeIcon icon={faSearch} />
				</div>
				<input
					type="text"
					name=""
					id=""
					value={filter}
					onChange={(e) => {
						setFilter(e.target.value);
					}}
				/>
			</div>
			<button
				onClick={() => {
					onSearch(filter);
				}}
			>
				Найти
			</button>
		</div>
	);
}

export default function () {
	const [cars, setCars] = useState<Car[]>([]);
	const [tariffs, setTariffs] = useState<string[]>([]);
	const [sortedCars, setSortedCars] = useState<Car[]>([]);
	const [currentSelected, setSelected] = useState<Selection | null>(null);
	const [sortDirection, setSortDirection] = useState<boolean>(false);
	const [sortColumn, setSortColumn] = useState<string>("name");
	const [filter, setFilter] = useState<string>("");
	useEffect(() => {
		fetch("https://city-mobil.ru/api/cars")
			.then((response) => response.json())
			.then((_data) => {
				console.log(_data);

				setCars(
					_data.cars.map((c: any, i: number) => {
						return { ...c, id: i };
					})
				);
				setTariffs(_data.tariffs_list);
			});
	}, []);

	function handleSearchAndFiltering(cars: Car[]): Car[] {
		console.log("Sorting");

		function nameSorter(a: Car, b: Car) {
			const aFullName = a.mark + a.model;
			const bFullName = b.mark + b.model;
			if (aFullName < bFullName) {
				return -1;
			}
			if (aFullName > bFullName) {
				return 1;
			}
			return 0;
		}
		function sortFilterAndReverse(
			filter: string,
			cars: Car[],
			sorter: (a: Car, b: Car) => number
		) {
			const sorted = cars.sort(sorter).filter((c) => {
				return JSON.stringify(c).toLowerCase().includes(filter.toLowerCase());
			});

			if (sortDirection) {
				return sorted.reverse();
			} else {
				return sorted;
			}
		}

		if (sortColumn == "name") {
			return sortFilterAndReverse(filter, [...cars], nameSorter);
		} else {
			return sortFilterAndReverse(filter, [...cars], (a, b) => {
				const aYear = a.tariffs[sortColumn]?.year || 0;
				const bYear = b.tariffs[sortColumn]?.year || 0;
				return aYear - bYear;
			});
		}
	}

	return (
		<div className="table-container">
			<Search onSearch={setFilter}></Search>
			<div className="table-wrapper">
				{true ? (
					<table>
						<thead>
							<tr>
								<th
									onClick={() => {
										setSortDirection(!sortDirection);
										setSortColumn("name");
										// handleSearchAndFiltering();
									}}
								>
									Марка и модель
									{sortColumn == "name" && <Icon up={sortDirection}></Icon>}
								</th>
								{tariffs.map((tariff) => {
									return (
										<th
											key={tariff}
											onClick={() => {
												setSortDirection(!sortDirection);
												setSortColumn(tariff);
												// handleSearchAndFiltering();
											}}
										>
											{tariff}
											{sortColumn == tariff && <Icon up={sortDirection}></Icon>}
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{handleSearchAndFiltering(cars).map((car, i) => {
								return (
									<tr key={car.id}>
										<td key="name">{car.mark + " " + car.model}</td>
										{tariffs.map((tariff) => {
											let tariff_ = car.tariffs[tariff];
											if (tariff_) {
												return (
													<td
														className="clickable"
														key={tariff}
														onClick={() => {
															setSelected({
																mark: car.mark,
																model: car.model,
																year: tariff_.year,
															});
														}}
													>
														{tariff_.year}
													</td>
												);
											} else {
												return <td key={tariff}>-</td>;
											}
										})}
									</tr>
								);
							})}
						</tbody>
					</table>
				) : (
					<p>Loading...</p>
				)}
			</div>
			{currentSelected && (
				<div className="current-selection">
					<span>{`Выбран автомобиль ${currentSelected?.mark} ${currentSelected?.model} ${currentSelected?.year} года выпуска`}</span>
				</div>
			)}
		</div>
	);
}
