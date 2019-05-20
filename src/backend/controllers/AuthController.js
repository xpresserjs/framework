const User = $.use.model($.config.auth.userModel);

class AuthController extends $.controller {

    index(x) {
        const data = {
            action: x.get("action", "login")
        };

        if ($.config.auth.viewsFromEngine) {
            return x.renderViewFromEngine('index', data, true);
        } else {
            return x.renderView('index', data);
        }
    }

    dashboard(x) {
        if ($.config.auth.viewsFromEngine) {
            return x.renderViewFromEngine('dashboard');
        } else {
            return x.renderView('dashboard');
        }
    }

    async login(x) {
        const email = x.get("login-email", "");
        const password = x.get("login-password", "");
        const errorMsg = "Incorrect email/password combination!";
        let logged = false;

        const user = await User.query()
            .where({email})
            .first();

        if (user === undefined) {
            x.with("login_error", errorMsg);
        } else {
            if ($.bcrypt.compareSync(password, user.password)) {
                logged = true;
                x.session.email = $.base64.encode(user.email);
                x.session.loginKey = $.base64.encode($.bcrypt.hashSync(user.email, 10));
                x.with("login", "Login successful. Welcome to your dashboard!");
            } else {
                x.with("login_error", errorMsg);
            }
        }

        // If is xhr request then return json.
        if (x.req.xhr) {
            return x.toApi({
                logged,
                msg: logged ? 'Login Successful.' : errorMsg,
            }, logged);
        }

        return x.redirectToRoute($.config.auth.afterLoginRoute);
    }

    async register(x) {
        const email = x.get("join-email");
        const user = await User.query()
            .where({email})
            .first();

        // User Exists
        if (user !== undefined) {
            x.with("reg_error", "Email has an account already.");
            return x.withOld().redirectBack();
        }

        // Encrypt User Password
        const password = $.bcrypt.hashSync(x.get("join-password"), 10);

        // Get User Name
        const name = x.get("join-name");

        // Setup new user data object
        const newUser = {email, password, name};

        // Inset new user data object
        await User.query().insert(newUser);

        x.with('reg_success', 'Registration successful, Login now!');
        return x.redirect('/');
    }

    logout(x) {

        delete x.session.email;
        delete x.session.loginKey;

        x.with({logout: "Logout successful."});

        return x.redirect("/");
    }
}

module.exports = AuthController;