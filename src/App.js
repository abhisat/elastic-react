import React, { Component } from 'react';
import './App.css';
import Graph from "./Graph";
import ReactLoading from 'react-loading';

class App extends Component {
    constructor() {
        super();
        this.state = {
            urls: [],
            before: '',
            after: '',
            interval: '',
            submitted: false,
            loading: false,
            labels: [],
            values:[],
            formErrors: {
                urls: false,
                before: false,
                after: false,
                interval: false
            }
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    calculateVals(response){
        var labels = [];
        var values = [];
        response.forEach(function(responseVal) {
            var temp = [];
            try {
                responseVal.aggregations.by_page_views.buckets.forEach(function (bucket) {
                    if (labels.indexOf(bucket.key)<0){
                        labels.push(bucket.key);
                    }
                    temp.push(bucket.doc_count);

                });
                values.push(temp);
            }
            catch(err) {
                console.log(err.message)
                temp.push(0);
                values.push(temp);
            }
        });
        this.setState({labels: labels});
        this.setState({values: values});
        this.setState({loading: false});
    }
    validateField(name, value){
        var url_regex = new RegExp(
            "^" +
            // protocol identifier
            "(?:(?:https?|ftp)://)" +
            // user:pass authentication
            "(?:\\S+(?::\\S*)?@)?" +
            "(?:" +
            // IP address exclusion
            // private & local networks
            "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
            "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
            "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
            "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
            "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
            "|" +
            // host name
            "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
            // domain name
            "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
            // TLD identifier
            "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
            // TLD may end with dot
            "\\.?" +
            ")" +
            // port number
            "(?::\\d{2,5})?" +
            // resource path
            "(?:[/?#]\\S*)?" +
            "$", "gi"
        );

        switch(name) {
            case 'urls':
                if(value != null) {
                    var urlVal = [];
                    var bool = false;
                    value.split(',').forEach(function (splits) {
                        if (!splits.match(url_regex))
                            bool = true;

                        else{
                            urlVal.push(splits);
                        }
                    });
                    console.log(this.state.urls)
                }
                this.state.formErrors.urls = bool;
                this.state.urls = urlVal;
                break;
            case 'before':
                if(!value.match(/\[0-9]/g))
                    this.state.formErrors.before = true;
                else
                    this.state.formErrors.before = false;
                break;
            case 'after':
                if(!value.match(/\[0-9]/g))
                    this.state.formErrors.after = true;
                else
                    this.state.formErrors.before = false;
                break;
            case 'interval':
                if(!value.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/))
                    this.state.formErrors.interval = true;
                else
                    this.state.formErrors.before = false;
                break;
            default:
                    break;
            }
    }

    handleChange(event){
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({[name]: event.target.value}, () => {this.validateField(name, value)});
    }
    handleSubmit(event){
        this.setState({'submitted': true});
        this.setState({loading: true});
        event.preventDefault();
        fetch('https://elastictest.herokuapp.com/page_views', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                urls: this.state.urls,
                before: this.state.before,
                after: this.state.after,
                interval: this.state.interval
            })
        }).then(response => {
            return response.json();
        }).then(response =>
        {
            this.calculateVals(response);
        });
    }


  render()
{
        if(this.state.submitted){
            if(this.state.loading){
                return(
                    <ReactLoading type="balls" color="#000000" height='191px' width='96px' />
                )
            }
            else{
                return(
                    <Graph labels={this.state.labels} values={this.state.values} urls={this.state.urls}/>
                )
            }
        }
        else{
            return (
                <div className="App">
                    <header className="App-header">
                        <h1 className="App-title">Date Histogram Visualisation</h1>
                    </header>
                    <p className="App-intro">
                        Please enter the GET request data below:
                    </p>

                    <form id="bodyForm" onSubmit={this.handleSubmit} onChange={this.handleChange}>
                        <label>URLS: <textarea placeholder="Enter URLs separated by commas..." type="text" name="urls" value={this.state.urls} /></label><br/>
                        <p id="error" style={{display: this.state.formErrors.urls ? 'block' : 'none' }}>Notice: Invalid Url Format</p>
                        <label>Before: <input placeholder="Enter milliseconds Timestamp..." type="text" name="before" value={this.state.before}/></label><br/>
                        <p id="error" style={{display: this.state.formErrors.before ? 'block' : 'none' }}>Notice: Invalid Timestamp</p>
                        <label>After: <input placeholder="Enter milliseconds Timestamp..." type="text" name="after" value={this.state.after}/></label><br/>
                        <p id="error" style={{display: this.state.formErrors.after ? 'block' : 'none' }}>Notice: Invalid Timestamp</p>
                        <label>Interval: <input placeholder="Enter interval such as 2m or 2s..." type="text" name="interval" value={this.state.interval}/></label><br/>
                        <p id="error" style={{display: this.state.formErrors.interval ? 'block' : 'none' }}>Notice: Invalid Interval</p>
                        <input type="submit" value="Submit"></input>
                    </form>
                </div>
            );
        }


}
}

export default App;
