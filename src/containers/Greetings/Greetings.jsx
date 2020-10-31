import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import icon from '../../assets/img/icon-34.png';
import './Greetings.css';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    // root: {
    //     display: 'flex',
    //     flexDirection: 'column',
    // },
    paper: {
        color: theme.palette.text.secondary,
        width: 400,
        maxHeight: 450,
        overflow: 'auto',
    },
    card: {
        display: "flex",
    },
    prouct_img: {
        display: 'flex',
        width: 100,
    },
    product_details: {
        display: 'flex',
    },
    content: {
        width: 250,
    },
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
        console.log("State product list updated: ", this.state);
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

    onClickProduct(product) {
        console.log("product clicked.", product.product_title);
        chrome.runtime.sendMessage({ type: "onClickProduct", data: product.product_link },
            function (res) {
                console.log("Page opened for product: ", product.title);
            }
        );
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
                        <Paper style={classes.paper}>
                            {
                                this.state.self_product_list.map((product) => (
                                    <Card key={product._id} className={classes.card}>
                                        <div >

                                        <CardActionArea style={{maxWidth:120}}>
                                            <img src={product.product_imgurl} alt={product.product_title} width="100" onClick={() => { this.onClickProduct(product) }} />
                                        </CardActionArea>
                                        </div>
                                        <div>
                                        <CardContent style={{maxWidth:200}} className={classes.content}>
                                            <Typography gutterBottom variant="body2" component="h5">
                                                {(product.product_title).substring(0, 15)}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" component="p">
                                                ${product.product_cost}
                                            </Typography>
                                        </CardContent>
                                        </div>

                                    </Card>
                                ))
                            }
                        </Paper>
                    </Grid>
                </Grid>


            </div>
        );
    }
}

export default withStyles(useStyles, { withTheme: true })(Greetings);
