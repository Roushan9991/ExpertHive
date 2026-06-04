import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getExpertByOwnerEmail } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const userRef = React.useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    // OAuth error handling
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1)
    );

    if (hashParams.get('error_description')) {
      const errorMsg = decodeURIComponent(
        hashParams
          .get('error_description')
          .replace(/\+/g, ' ')
      );

      toast.error(
        errorMsg.includes('Database error')
          ? 'Google Login Failed'
          : errorMsg
      );

      window.history.replaceState(
        null,
        '',
        window.location.pathname
      );
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setAuthUser(session.user);
        } else {
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (err) {
        console.error('getSession error:', err);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }

      if (mounted) {
        const { data } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;
            if (event === 'SIGNED_OUT') {
              setAuthUser(null);
              setUser(null);
              setLoading(false);
              navigate('/', { replace: true });
              return;
            }

            if (session?.user) {
              setAuthUser(session.user);
            } else {
              setAuthUser(null);
              setUser(null);
              setLoading(false);
              setInitialized(true);
            }
          }
        );
        subscription = data.subscription;
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!authUser) return;

    let mounted = true;

    const loadProfile = async () => {
      try {
        await fetchProfile(authUser);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  const fetchProfile = async (authUser) => {
    try {
      if (!userRef.current) {
        setLoading(true);
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      if (profile?.role === 'expert') {
        try {
          const expertProfile =
            await getExpertByOwnerEmail(
              profile.email
            );

          console.log(
            'Expert status:',
            expertProfile?.status
          );
        } catch (err) {
          console.error(err);
        }
      }

      const email =
        (
          profile?.email ||
          authUser?.email ||
          ''
        )
          .trim()
          .toLowerCase();

      const isAdmin =
        email ===
          'support@experthive.co.in' ||
        email ===
          (
            import.meta.env
              .VITE_SMTP_EMAIL || ''
          )
            .trim()
            .toLowerCase();

      const finalUser = profile
        ? {
            ...authUser,
            ...profile,
            role: isAdmin
              ? 'admin'
              : profile.role,
          }
        : {
            id: authUser.id,
            email: authUser.email,
            name:
              authUser.user_metadata
                ?.full_name ||
              authUser.email,
            role: isAdmin
              ? 'admin'
              : authUser.user_metadata
                  ?.role ||
                'student',
          };

      setUser(finalUser);
    } catch (err) {
      console.error(
        'fetchProfile error:',
        err
      );

      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = async (
    email,
    password
  ) => {
    const { data, error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) {
      toast.error(error.message);
      return false;
    }

    if (data?.user) {
      await fetchProfile(data.user);
    }

    toast.success(
      'Logged in successfully!'
    );

    return true;
  };

  const signup = async (
    name,
    email,
    password,
    role = 'student',
    autoLogin = true
  ) => {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role,
          },
        },
      });

    if (error) {
      toast.error(error.message);
      return false;
    }

    if (!autoLogin) {
      await supabase.auth.signOut();
      setUser(null);
    } else if (data?.user) {
      await fetchProfile(data.user);
    }

    toast.success(
      'Account created successfully!'
    );

    return true;
  };

  const logout = async () => {
    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setLoading(false);

      toast.success(
        'Logged out successfully!'
      );
    } catch (err) {
      console.error(err);

      toast.error(
        'Logout failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        fetchProfile,
      }}
    >
      {initialized ? children : null}
    </AuthContext.Provider>
  );
};