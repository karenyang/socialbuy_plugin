import React, {
    Component
} from 'react';
import './Greetings.css';
import IconTabs from '../icontabs/iconstabs';
import SearchPage from '../search_page/search_page';
import RecentActivitiesPage from "../recent_activities/recent_activities";
import UserInfoPage from "../userinfo_page/userinfo_page";


class Greetings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user_name: this.props.user_name,
            user_id: this.props.user_id,
            tab: parseInt(this.props.match.params.tab_id),
        }
        window.localStorage.setItem("tab",  this.props.match.params.tab_id);

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
        }

    }

    handleTabChange = (value) =>{
        console.log("Tab changed to ",  value)
        this.setState({
            tab: value
        })
        window.localStorage.setItem("tab",  value);

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
                { this.state.tab === 0 &&  <RecentActivitiesPage user_id={this.state.user_id} />}
                { this.state.tab === 1 &&  <SearchPage user_id={this.state.user_id}  /> }
                { this.state.tab === 2 &&  <UserInfoPage onLogOut={this.onLogOut} user_id={this.state.user_id} />}
                <IconTabs handleTabChange={this.handleTabChange} tab={this.state.tab}/>
            </div >
        );
    }
}

export default Greetings;