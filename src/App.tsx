import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Table from "./Table/Table";

function App() {
	return (
		<div className="app">
			<header></header>
			<aside></aside>
			<div className="content">
				<Table></Table>
			</div>
			<footer></footer>
		</div>
	);
}

export default App;
