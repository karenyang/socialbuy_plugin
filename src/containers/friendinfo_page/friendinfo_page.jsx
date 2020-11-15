console.log("enter friendinfo_page")
import React from 'react';
import logo from '../../assets/img/logo.svg';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { ThreeSixtySharp } from '@material-ui/icons';

class FriendInfoPage extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     user_name: "",
        //     user_id: "",
        // };
        this.state = {
            return_tab: this.props.return_tab, 
        }
        console.log("Props: ", this.props);
    }
    onClickBack = () =>{
        const tab = window.localStorage.getItem("tab");
        console.log('Before go back, go the key Tab is ', tab);
        this.props.history.push("/greetings/" + tab);
      }

    render() {
        return (
            <div>
                <img src={logo} alt="icon" />
                <IconButton onClick={this.onClickBack}>
                    <ArrowBackIcon />
                </IconButton>
                <p> Hello! I am {this.props.match.params.user_id} </p>

            </div>
        )
    }
};

export default FriendInfoPage;
