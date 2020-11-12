import React, {
    Component
} from 'react';
import {
    Button,
    Typography,
    Card,
    Divider,
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import Draggable from 'react-draggable';
import fetchLikedProductInfo from './modules/fetch_product';
import "./sidebox.css";

const pink_heart = "https://crissov.github.io/unicode-proposals/img/pink-heart_emojitwo.svg";
const red_heart = "https://crissov.github.io/unicode-proposals/img/2764_emojitwo.svg";

const icon = "https://lh3.googleusercontent.com/7RD2Vgs9Xpieti3nKf9IWQeq8nd7hIR_-zVdwHdzw87CsDT_TfstQSunauqnbWjgqA1WjhI=s85";
class SideBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            show_product: false,
            cursor: "default",
            product: null,
            added_product: false,
        }
    }

    componentDidMount = () => {
        let product = fetchLikedProductInfo();
        this.setState({
            product: product,
        });
    }

    onMouseOverIcon = () => {
        console.log("mouse over. ")
        this.setState({
            transform: "translate(0px, 50px)",
            show_product: true,
        });
    }

    onMouseLeaveIcon = () => {
        console.log("mouse leave. ")
        this.setState({
            transform: "translate(0px, 0px)",
        });
    }

    onMouseLeaveBlock = () => {
        console.log("mouse leave block. ")
        this.setState({
            show_product: false,
        });
    }

    onClickAddCollection = () => {
        console.log("mouse click. ");
        if (!this.state.liked && this.state.product !== null) {
            chrome.runtime.sendMessage({ type: "onLikedProductsToBeAdded", data: this.state.product },
                function (response) {
                    console.log('this is the response from the background page for onLikedProductsToBeAdded', response);
                    if (response.status === 200) {
                        console.log("onLikedProductsToBeAdded succeeded.", response.data);
                    } else {
                        console.log("onLikedProductsToBeAdded failed.", response.data);
                    }
                }
            );
        }
        this.setState({
            liked: true,
            added_product: true,
        });

    }

    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    render() {
        return (
            <Draggable axis="y">
                <div style={{ display: "inline-block", top: "200px", right: "0px", margin: "0px", position: "fixed", zIndex: 285 }} onMouseLeave={this.onMouseLeaveBlock}>
                    <CardActionArea style={{ padding: "0px" }}>
                        <img className="iconimage" alt="icon" draggable="false" src={icon} width="56" height="56" style={{ zIndex: 288, margin: "0px" }} onMouseOver={this.onMouseOverIcon} onMouseLeave={this.onMouseLeaveIcon} />
                    </CardActionArea>
                    {this.state.product !== null && this.state.show_product &&
                        <Card style={{ width: 250, position: "absolute", right: "0px", display: "flex", flexDirection: 'column', justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between" }}>
                                <img alt={this.state.product.product_title} src={this.state.product.product_imgurl} width="80" height="80" style={{ backgroundColor: "grey", margin: "10px" }} />
                                <CardContent style={{ paddingTop: "10px", paddingRight: "5px", paddingLeft: "5px" }} >
                                    <Typography gutterBottom variant="body2" component="h5" style={{ fontSize: 12, padding: "5px" }}>
                                        {this.cropTitle(this.state.product.product_title)}
                                    </Typography>
                                </CardContent>
                            </div>
                            <Divider />
                            <CardActionArea style={{ paddingBottom: "20px"}}>
                                {this.state.added_product ?
                                    <Button onClick={this.onClickAddCollection} style={{ textTransform: "none", width: "180px", backgroundColor: "#E9967A", color: "#F5F5DC" }} >
                                        Added
                                    </Button> :
                                    <Button onClick={this.onClickAddCollection} style={{ textTransform: "none", width: "180px", backgroundColor: "#FF6347", color: "white" }} >
                                        Add to Collection
                                    </Button>
                                }
                            </CardActionArea>


                        </Card>
                    }
                </div>

            </Draggable>

        )
    }
}

export default SideBox;