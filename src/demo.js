// ----- <BudgetCalc /> -----
var BudgetCalc = React.createClass({

    // public demo no log in required
    
    /*fbLogin: function() {
    },*/

    fbLogout: function() {
        alert('public demo no log in required');
    },

    componentWillMount: function() {
        // public demo no log in required
    },

    loadData: function() {
        var ref = new Firebase('https://sbapp.firebaseio-demo.com//');
        ref.child('items').on('value', function(snap) {
            var balance, products = [];
            //console.log('data did load');
            snap.forEach(function(productSnap) {
                var item = productSnap.val();
                item.key = productSnap.key();
                products.unshift(item);
            });
            // get latest balance
            if (products[0])
                balance = products[0].balance;
            else
                balance = this.props.initialFund;

            this.setState({
                balance: balance,
                products: products
            });
        }.bind(this));
    },

    componentDidMount: function() {
        this.loadData();
    },

    getInitialState: function() {
        return {
            // isLoggedIn: false,
            balance: this.props.initialFund,
            products: []
        }
    },

    handleNewItem: function(newItem) {
        // push returns a number, not array
        var ref = new Firebase('https://sbapp.firebaseio-demo.com//items');
        ref.push(newItem);
    },

    handleUndo: function() {
        var key = this.state.products[0].key;
        var ref = new Firebase('https://sbapp.firebaseio-demo.com//items/' + key);
        ref.remove();
    },

    render: function() {
        return (
            <div className="container">
                <div className="row">
                    <TotalBalance logout={this.fbLogout} balance={this.state.balance} fund={this.props.initialFund}/>
                    <AddItemForm balance={this.state.balance} onNewItem={this.handleNewItem}/>
                </div>

                <BalanceSheet undo={this.handleUndo} products={this.state.products} />
            </div>
        );
        

    }
});

// ----- <TotalBalance /> -----
var TotalBalance = React.createClass({
    // Math.round((50/75)*1000) / 10 round to 1 decimal
    render: function() {
        var remaining = Math.round((this.props.balance / this.props.fund) * 1000) / 10;
        var progressStyle = {
            width: remaining + '%'
        };
        return (
            <div className="col s12 m6">
                <div className="card blue-grey darken-1">
                    <div className="card-content white-text">
                        <span className="card-title">Total Balance: ${this.props.balance}</span>
                        <p>Starting fund: ${this.props.fund} | {remaining}% remaining</p>
                        <div className="progress">
                            <div className="determinate" style={progressStyle}></div>
                        </div>
                    </div>
                    <div className="card-action">
                        <a href="#">Home</a>
                        <a href='#' onClick={this.props.logout}>Log Out</a>
                    </div>
                </div>
            </div>
        );
    }
});

// ----- <AddItemForm /> -----
var AddItemForm = React.createClass({

    handleSubmit: function(e) {
        // Math.round(parseFloat('123.2343') * 100) / 100 (round 2 dec)
        e.preventDefault();
        var product = React.findDOMNode(this.refs.product).value.trim(),
            price = Math.round(parseFloat(React.findDOMNode(this.refs.price).value.trim()) * 100) / 100,
            date = React.findDOMNode(this.refs.date).value.trim(),
            newBalance = this.props.balance - price;

        if (!product || !price) {
            return;
        }
        var newItem = {
            product: product,
            price: price,
            date: date ? date : new Date().toJSON().slice(0,10),
            balance: newBalance
        };
        this.props.onNewItem(newItem);
        this.refs.addItemForm.getDOMNode().reset();
    },

    render: function() {
        return (
            <form ref="addItemForm" className="col s12 m6" onSubmit={this.handleSubmit}>
                <h5 className="center-align yellow-text text-darken-3">New Item</h5>
                <div className="row">
                    <div className="input-field col s6">
                        <input placeholder="product name" ref="product" type="text" className="validate" />
                    </div>
                    <div className="input-field col s6">
                        <input placeholder="price paid" ref="price" type="text" className="validate" />
                    </div>
                </div>
                <div className="row">
                    <div className="input-field col s6">
                        <input ref="date" type="date" className="datepicker" />
                    </div>
                    <div className="input-field col s6">
                        <button type="submit" className="waves-effect waves-light btn">Add Item</button>
                    </div>
                </div>
            </form>
        );
    }
});

// ----- <BalanceSheet /> -----
var BalanceSheet = React.createClass({

    render: function() {
        var sheetItems = this.props.products.map(function(item, index) {
            // only first item undoable
            var undo = index ? false : this.props.undo;

            return <SheetItem
                product={item.product}
                price={item.price}
                date={item.date}
                balance={item.balance}
                onDelete={undo} />;
        }.bind(this));

        return (
            <table className="striped responsive-table centered">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Date</th>
                        <th>New Balance</th>
                        <th>Undo</th>
                    </tr>
                </thead>
                <tbody>
                    {sheetItems}
                </tbody>
            </table>
        );
    }
});

// ----- <SheetItem /> -----
var SheetItem = React.createClass({

    render: function() {
        var textColor;
        if (this.props.onDelete)
            textColor = 'red-text text-darken-4';
        else
            textColor = 'red-text text-lighten-4';
        return (
            <tr>
                <td>{this.props.product}</td>
                <td>{this.props.price}</td>
                <td>{this.props.date}</td>
                <td>{this.props.balance}</td>
                <td>
                    <span className={textColor} onClick={this.props.onDelete} >X</span>
                </td>
            </tr>
        );
    }
});



var ReactBudget = React.render(
    <BudgetCalc initialFund={750}/>,
    document.getElementById('app')
);