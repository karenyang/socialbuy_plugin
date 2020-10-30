import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Paper,
    List,
    Card
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import icon from '../../assets/img/icon-34.png';
import './Greetings.css';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        width: 400,
        maxHeight: 500,
        overflow: 'auto',
    },
    card: {
        padding: theme.spacing(10),
        margin: 10,
    }
}));



class Greetings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: this.props.user_name,
            user_id: this.props.user_id,
            self_product_list: [],
        }
        console.log(this.state);
    }

    updateSelfProductList = (product_list) => {
        this.setState({
            self_product_list: product_list,
        });
    }

    componentDidMount = () => {
        const updateSelfProductList = this.updateSelfProductList;
        chrome.runtime.sendMessage({ type: "onLoadSelfProductList" },
            function (res) {
                console.log('Greetings receives reply from background for onLoadSelfProductList ', res.data);
                if (res.status === 200) {
                    console.log("onLoadSelfProductList succeeded.");
                    updateSelfProductList(res.data.product_list);
                }
                else {
                    console.error(res.data + ", onLoadSelfProductList failed.");
                }
            }
        );
    }

    componentDidUpdate = (prevProps) => {
        if (prevProps.user_name !== this.props.user_name) {
            if (this.props.user_name === "") {
                this.props.history.push("/admin/login");
            }
            this.setState({
                user_name: this.props.user_name
            });
        }
        if (prevProps.user_id !== this.props.user_id) {
            if (this.props.user_id === "") {
                this.props.history.push("/admin/login");
            }
            this.setState({
                user_id: this.props.user_id
            });
            const updateSelfProductList = this.updateSelfProductList;
            chrome.runtime.sendMessage({ type: "onLoadSelfProductList" },
                function (res) {
                    console.log('Greetings receives reply from background for onLoadSelfProductList ', res.data);
                    if (res.status === 200) {
                        console.log("onLoadSelfProductList succeeded.");
                        updateSelfProductList(res.data.product_list);
                    }
                    else {
                        console.error(res.data + ", onLoadSelfProductList failed.");
                    }
                }
            );
        }

    }

    render() {
        const classes = this.props;
        return (
            <div className="container">
                <Grid container spacing={3} >
                    <Grid item xs={3}>
                        <img class="topleft" src={icon} alt="extension icon" />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h5" color="inherit">
                            Welcome! {this.state.user_name}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Button className="button" onClick={this.props.onLogOut}>
                            Log Out
				        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <div className="container">
                            <Card className={classes.card}>
                                <Typography variant="h5" color="inherit">
                                    This is a card 1
                                    </Typography>
                            </Card>
                            <Card className={classes.card}>
                                <Typography variant="h5" color="inherit">
                                    This is a card 2
                                </Typography>
                            </Card>


                        </div>

                    </Grid>
                </Grid>


            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(Greetings);
