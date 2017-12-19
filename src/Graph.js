/**
 * Created by abhisheksatpathy on 17/12/17.
 */
import React, { Component } from 'react';
import './App.css';
import 'plotly.js';

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            urls: this.props.urls,
            labels: this.props.labels,
            values: this.props.values,
            colours: [],
            loaded: false,
            trace: []
        };
    }
    componentDidMount(){
        var Plotly = require('plotly.js');

        for(var i = 0; i < this.state.labels.length; i++){
            this.state.labels[i] = new Date(this.state.labels[i]).toLocaleTimeString();
        }

        for(var j = 0; j < this.state.labels.length; j++){
            this.state.colours[j] = "rgba(" + Math.random() * (255) + ", " + Math.random() * (255) + "," + Math.random() * (255) + ", 0.7)";
        }
        for(var l = 0; l < this.state.urls.length; l++){
            this.state.trace[l] = {
                x: this.state.labels,
                y: this.state.values[l],
                name: this.state.urls[l],
                histnorm: "count",
                marker: {
                    color: this.state.colours[l],
                    line: {
                        color:  "rgba(0, 0, 0, 1)",
                        width: 1
                    }
                },
                opacity: 0.75,
                type: "bar",

            };
        }
        var layout = {
            barmode: "stack",
            showlegend: true,
            legend: {
                x: 1000,
                y: 1500
            },
            xaxis: {title: "Timestamp"},
            yaxis: {title: "Count"}
        };

        Plotly.newPlot('graph',this.state.trace, layout);

        this.setState({loaded: true});
    }
    render(){
            return(
                <div>
                    <header className="App-header">
                        <h1 className="App-title">Date Histogram Visualisation</h1>
                    </header>
                    <div id="graph"></div>
                </div>
            )
        }
}

export default Graph;