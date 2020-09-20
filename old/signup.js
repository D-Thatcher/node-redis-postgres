import React, {useState} from 'react';


const Signup = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    console.log("csrfToken",props.csrfToken);

    return (
        <form  method="post" action="/users">
            <input type="hidden" name="_csrf" value={props.csrfToken}/>
            <p>Signup</p>
            <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input type="submit" value="Signup" />
        </form>
    );
};
// Signup.getInitialProps = async ({ query: { csrfToken } }) => {
//     return { csrfToken: csrfToken }
// }

Signup.getInitialProps = ({ res }) => {

    if (res) {
        res.writeHead(301, {
            Location: 'new/url/destination/here'
        });
        res.end();
    }

    return {};
};


export default Signup;