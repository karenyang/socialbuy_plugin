import React, {
    Component
} from 'react';
import './Greetings.css';
import IconTabs from '../icontabs/iconstabs';
import SearchPage from '../search_page/search_page';
import RecommmendationPage from "../recommendation_page/recommendation_page";
import UserInfoPage from "../userinfo_page/userinfo_page";


class Greetings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: this.props.user_name,
            user_id: this.props.user_id,
            search_value: "",
            self_product_list: [],
            product_expanded: {},
            search_result: "",
            tab: 0,
        }
        console.log(this.state);
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

    handleTabChange = (value) =>{
        console.log("Tab changed to ",  value)
        this.setState({
            tab: value
        })
    }

    onLogOut = () => {
        let history = this.props.history;
        console.log("about to log out");
        chrome.runtime.sendMessage({ type: "onLogout" },
            function (res) {
                console.log('this is the response from the background page for onLogout', res);
                if (res.status === 200) {
                    console.log("Logging out.", res.data);
                    history.push('/admin/login');
                }
                else {
                    alert(res.data);
                    throw (new Error(res.data));
                }
            });
    }


    render() {
        return (
            <div className="container">
                { this.state.tab === 0 &&  <RecommmendationPage />}
                { this.state.tab === 1 &&  <SearchPage /> }
                { this.state.tab === 2 &&  <UserInfoPage onLogOut={this.onLogOut} />}
                <IconTabs handleTabChange={this.handleTabChange}/>
            </div >
        );
    }
}

export default Greetings;
