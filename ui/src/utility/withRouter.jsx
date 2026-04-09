import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    const history = {
      push: (path) => navigate(path),
      replace: (path) => navigate(path, { replace: true }),
      goBack: () => navigate(-1),
    };

    const match = { params };

    return (
      <Component
        {...props}
        history={history}
        match={match}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  }

  ComponentWithRouterProp.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;
  return ComponentWithRouterProp;
}
