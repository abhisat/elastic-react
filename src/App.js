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
            validInputs: false,
            labels: [],
            values:[],
            urlErrors: false,
            beforeErrors: false,
            afterErrors: false,
            intervalErrors: false,
            formErrors: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    //Function to take the response from API and calculate the values for the Graph
    calculateVals(response){
        var labels = [];
        var values = [];
        var norm = 0;
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
        values.forEach(function(arr){
            if(arr.length > 1) {
                norm = arr.length;
            }
        });
        values.forEach(function (arr) {
            if(arr.length === 1){
                for(var k = 0; k < norm-1; k++){
                    arr.push(0);
                }
            }
        })
        this.setState({labels: labels});
        this.setState({values: values});
        this.setState({loading: false});
    }
    //Function to take the response from API and calculate the values for the Graph

    //Function to validate timestamp and interval inputs in the form
    validateInput(name, value){
        if(value != null){
            switch (name) {
                case 'urls':
                    this.state.urls = value.split(',');
                    this.setState({urlErrors: false});
                    break;
                case 'before':
                    if (value.match(/^[0-9]+$/) && value !== '')
                        this.setState({beforeErrors: false });
                    else
                        this.setState({beforeErrors: true });
                    break;
                case 'after':
                    if (value.match(/^[0-9]+$/) && value !== '')
                        this.setState({afterErrors: false });
                    else
                        this.setState({afterErrors: true });
                    break;
                case 'interval':
                    if (value.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/) && value !== '')
                        this.setState({intervalErrors: false });
                    else
                        this.setState({intervalErrors: true });
                    break;
                default:
                    break;
            }
        }
    }
    //Function to validate timestamp and interval inputs in the form

    //Function to handle change as the user inputs
    handleChange(event){
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({[name]: event.target.value}, () => {this.validateInput(name, value)});
    }
    //Function to handle change as the user inputs


    //Function to validate all inputs and make the API call if the inputs are valid
    handleSubmit(event){

        if(this.state.urls.length ===0 || this.state.before ==='' || this.state.after ==='' || this.state.interval ===''){
            this.state.formErrors = true;
            if(this.state.url === []){
                this.setState({urlErrors: true});
            }
            else
                this.setState({urlErrors: false});
        }
        else
            this.state.formErrors = false;

        if(!this.state.beforeErrors && !this.state.afterErrors && !this.state.intervalErrors){
            this.state.validInputs = true;
        }
        else
            this.state.validInputs = false;

        //Make API call and fetch the response if the inputs are valid
        if(this.state.validInputs && !this.state.formErrors){
            this.setState({submitted: true});
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
        //Make API call and fetch the response if the inputs are valid

        //Display the error message if the inputs are not valid
        else{
            event.preventDefault();
            this.setState({formErrors: true});
        }
        //Display the error message if the inputs are not valid
    }
    //Function to validate all inputs and make the API call if the inputs are valid

  render() {

        if(this.state.submitted){
            // Render loading animation if data is still loading but form is submitted
            if(this.state.loading){
                return(
                    <div>
                        <header className="App-header">
                            <h1 className="App-title">Date Histogram Visualisation</h1>
                        </header>
                        <ReactLoading id="loading" type="balls" color="#000000" height='191px' width='96px' />
                    </div>
                )
            }
            // Render graph if data is has loaded
            else{
                return(
                    <Graph labels={this.state.labels} values={this.state.values} urls={this.state.urls}/>
                )
            }
        }
        // Render input form if nothing has been submitted
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
                        <p id="error" style={{display: this.state.formErrors ? 'block' : 'none' }}><b>Notice: Please check for errors in the form.</b></p>
                        <label>URLS:     <textarea placeholder="Enter URLs separated by commas..." type="text" name="urls" value={this.state.urls} /></label><br/>
                        <p id="error" style={{display: this.state.urlErrors ? 'block' : 'none' }}>Notice: URL cannot be empty</p>
                        <label>Before:   <input placeholder="Enter milliseconds Timestamp..." type="text" name="before" value={this.state.before}/></label><br/>
                        <p id="error" style={{display: this.state.beforeErrors ? 'block' : 'none' }}>Notice: Invalid Timestamp</p>
                        <label>After:    <input placeholder="Enter milliseconds Timestamp..." type="text" name="after" value={this.state.after}/></label><br/>
                        <p id="error" style={{display: this.state.afterErrors ? 'block' : 'none' }}>Notice: Invalid Timestamp</p>
                        <label>Interval: <input placeholder="Enter interval such as 2m or 2s..." type="text" name="interval" value={this.state.interval}/></label><br/>
                        <p id="error" style={{display: this.state.intervalErrors ? 'block' : 'none' }}>Notice: Invalid Interval</p>
                        <input type="submit" value="Submit"></input>
                    </form>
                </div>
            );
        }


}
}

export default App;
