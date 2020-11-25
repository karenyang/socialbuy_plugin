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
import Draggable from 'react-draggable';
import "./sidebox.css";
import fetchLikedProductInfo from '../../pages/Content/modules/fetch_product';


const icon_url = "https://i.ibb.co/1rgS6hX/icon-noborder.png"
class SideBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show_product: false,
            product: "",
            added_product: false,
            liked_product_list: [],
            logged_in: true,
        }
    }

    handleUpdate = (name, value) => { //[name of variable]: value of variable
        this.setState({ [name]: value, });
        console.log("Update state-> ", this.state);
    }

    componentDidMount = () => {
        // Check Log In
        const handleUpdate = this.handleUpdate;
        const curr_product = this.props.product;
        chrome.runtime.sendMessage({ type: "onLoadUserLikedProductList" },
            function (res) {
                console.log('Userinfo Page receives reply from background for onLoadUserBoughtProductList ', res.data);
                if (res === "User have not logged in") {
                    console.log("User have not logged in");
                    handleUpdate("logged_in", false);
                }
                else if (res.status === 200) {
                    console.log("onLoadUserLikedProductList succeeded.");
                    let match = res.data.liked_product_list.filter(p => p.product_link === curr_product.product_link)
                    if (match.length > 0) {
                        console.log("This product is already in user's liked product list.")
                        handleUpdate("added_product", true);
                    }
                }
                else {
                    console.error(res.data + ", onLoadUserLikedProductList failed.");
                }
            }
        );

    }

    onMouseOverIcon = () => {
        let product = fetchLikedProductInfo();
        this.setState({
            transform: "translate(0px, 50px)",
            show_product: true,
            product: product,
        });
    }

    onMouseLeaveIcon = () => {
        this.setState({
            transform: "translate(0px, 0px)",
        });
    }

    onMouseLeaveBlock = () => {
        this.setState({
            show_product: false,
        });
    }

    onClickAddCollection = () => {
        console.log("mouse click. ");
        if (!this.state.added_product && this.state.product !== null) {
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
            added_product: true,
        });

    }

    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    render() {
        return (
            <Draggable>
                <div style={{ display: "inline-block", position: "fixed", top: "200px", right: "0px", margin: "0px", zIndex: 285 }} onMouseLeave={this.onMouseLeaveBlock}>
                    <CardActionArea style={{ padding: "0px" }}>
                        <img className="iconimage" alt="icon" draggable="false" src={icon_url} width="56" height="56" style={{ zIndex: 288, margin: "0px" }} onMouseOver={this.onMouseOverIcon} onMouseLeave={this.onMouseLeaveIcon} />
                    </CardActionArea>
                    {this.state.product !== null && this.state.show_product &&
                        <Card style={{ backgroundColor: "white", width: 250, position: "absolute", right: "0px", display: "flex", flexDirection: 'column', justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ padding: 5, display: "flex", flexDirection: 'row', justifyContent: "space-between" }}>
                                <img className="productimage" alt={this.state.product.product_title} src={this.state.product.product_imgurl} style={{ padding: 5 }} />
                                <CardContent style={{ paddingTop: "10px", paddingRight: "5px", paddingLeft: "5px" }} >
                                    <Typography gutterBottom variant="body2" component="h5" style={{ fontSize: 12, padding: "5px" }}>
                                        {this.cropTitle(this.state.product.product_title)}
                                    </Typography>
                                </CardContent>
                            </div>
                            <Divider />
                            <CardActionArea style={{ paddingBottom: "20px" }}>
                                {!this.state.logged_in &&
                                    <Typography gutterBottom variant="body2" component="h5" style={{padding: "5px"}}>
                                        Log In to Add Product
                                    </Typography>
                                }
                                {this.state.added_product && this.state.logged_in &&
                                    <Button onClick={this.onClickAddCollection} style={{ textTransform: "none", width: "180px", backgroundColor: "#E9967A", color: "#F5F5DC" }} >
                                        Added
                                </Button>}
                                {!this.state.added_product && this.state.logged_in &&
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