import React, {useState} from 'react';


const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    console.log("HELLOWORLD",props.csrfToken)

    return (
        <form  method="post" action="/login">
            <input type="hidden" name="_csrf" value={props.csrfToken}/>
            <p>Login</p>
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
            <input type="submit" value="Login" />
        </form>
    );
};
Login.getInitialProps = async ({ query: { csrfToken } }) => {
    return { csrfToken: csrfToken }
}


export default Login;