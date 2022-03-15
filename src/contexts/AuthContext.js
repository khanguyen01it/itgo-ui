import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
// utils
import axios from '../utils/axios';
import { isValidToken, setSession } from '../utils/jwt';
import { getCartApi } from '../redux/slices/cart';

// ----------------------------------------------------------------------

const initialState = {
	isAuthenticated: false,
	isInitialized: false,
	user: null,
};

const handlers = {
	INITIALIZE: (state, action) => {
		const { isAuthenticated, user } = action.payload;
		return {
			...state,
			isAuthenticated,
			isInitialized: true,
			user,
		};
	},
	LOGIN: (state, action) => {
		const { user } = action.payload;

		return {
			...state,
			isAuthenticated: true,
			user,
		};
	},
	LOGOUT: (state) => ({
		...state,
		isAuthenticated: false,
		user: null,
	}),
	REGISTER: (state, action) => {
		const { user } = action.payload;

		return {
			...state,
			isAuthenticated: true,
			user,
		};
	},
};

const reducer = (state, action) =>
	handlers[action.type] ? handlers[action.type](state, action) : state;

const AuthContext = createContext({
	...initialState,
	login: () => Promise.resolve(),
	logout: () => Promise.resolve(),
	register: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
	children: PropTypes.node,
};

function AuthProvider({ children }) {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		const initialize = async () => {
			try {
				const accessToken = window.localStorage.getItem('accessToken');

				if (accessToken && isValidToken(accessToken)) {
					setSession(accessToken);

					const response = await axios.get('/api/my-account');
					const { user } = response.data;

					dispatch({
						type: 'INITIALIZE',
						payload: {
							isAuthenticated: true,
							user,
						},
					});
					getCartApi();
				} else {
					dispatch({
						type: 'INITIALIZE',
						payload: {
							isAuthenticated: false,
							user: null,
						},
					});
				}
			} catch (err) {
				console.error(err);
				dispatch({
					type: 'INITIALIZE',
					payload: {
						isAuthenticated: false,
						user: null,
					},
				});
			}
		};

		initialize();
	}, []);

	const login = async (email, password) => {
		const response = await axios.post('/api/auth/login', {
			email,
			password,
		});
		if (!response.data.success) return;
		const { accessToken, user } = response.data;

		setSession(accessToken);
		getCartApi();
		dispatch({
			type: 'LOGIN',
			payload: {
				user,
			},
		});
	};

	const register = async (email, password, firstName, lastName) => {
		const response = await axios.post('/api/auth/register', {
			email,
			password,
			firstName,
			lastName,
		});

		console.log(response);

		if (!response.data.success) return;
		const { accessToken, user } = response.data;

		window.localStorage.setItem('accessToken', accessToken);
		dispatch({
			type: 'REGISTER',
			payload: {
				user,
			},
		});
	};

	const logout = async () => {
		setSession(null);
		dispatch({ type: 'LOGOUT' });
	};

	return (
		<AuthContext.Provider
			value={{
				...state,
				login,
				logout,
				register,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export { AuthContext, AuthProvider };
