import {browserHistory} from 'react-router';
import styled from 'react-emotion';
import React from 'react';

import {t, tct} from 'app/locale';
import AsyncComponent from 'app/components/asyncComponent';
import AutoSelectText from 'app/components/autoSelectText';
import Button from 'app/components/button';
import ExternalLink from 'app/components/externalLink';
import PlatformPicker from 'app/components/platformPicker';
import SentryTypes from 'app/sentryTypes';
import SettingsPageHeader from 'app/views/settings/components/settingsPageHeader';
import TextBlock from 'app/views/settings/components/text/textBlock';
import recreateRoute from 'app/utils/recreateRoute';
import space from 'app/styles/space';
import withOrganization from 'app/utils/withOrganization';

class ProjectInstallOverview extends AsyncComponent {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
  };

  get isGettingStarted() {
    return window.location.href.indexOf('getting-started') > 0;
  }

  get hasSentry10() {
    return this.props.organization.features.includes('sentry10');
  }

  getEndpoints() {
    const {orgId, projectId} = this.props.params;
    return [['keyList', `/projects/${orgId}/${projectId}/keys/`]];
  }

  redirectToDocs = platform => {
    const {orgId, projectId} = this.props.params;
    const prefix = recreateRoute('', {...this.props, stepBack: -3});
    let rootUrl = `${prefix}install`;

    if (this.isGettingStarted) {
      rootUrl = this.hasSentry10
        ? `/organizations/${orgId}/projects/${projectId}/getting-started`
        : `/${orgId}/${projectId}/getting-started`;
    }

    browserHistory.push(`${rootUrl}/${platform}/`);
  };

  toggleDsn = () => {
    this.setState(state => ({showDsn: !state.showDsn}));
  };

  render() {
    const {orgId, projectId} = this.props.params;
    const {keyList} = this.state;

    const issueStreamLink = this.hasSentry10
      ? `/organizations/${orgId}/issues/#welcome`
      : `/${orgId}/${projectId}/#welcome`;

    const dsn = keyList ? keyList[0].dsn : {};

    return (
      <div>
        <SettingsPageHeader title={t('Configure your application')} />
        <TextBlock>
          {t(
            'Get started by selecting the platform or language that powers your application.'
          )}
        </TextBlock>

        {this.state.showDsn ? (
          <DsnInfo>
            <DsnContainer>
              <strong>{t('DSN')}</strong>
              <DsnValue>{dsn.secret}</DsnValue>

              <strong>{t('Public DSN')}</strong>
              <DsnValue>{dsn.public}</DsnValue>
            </DsnContainer>

            <p>
              <small>{t('The public DSN should be used with JavaScript.')}</small>
            </p>
            <Button priority="primary" to={issueStreamLink}>
              {t('Got it! Take me to the Issue Stream.')}
            </Button>
          </DsnInfo>
        ) : (
          <p>
            <small>
              {tct('Already have things setup? [link:Get your DSN]', {
                link: <Button priority="link" onClick={this.toggleDsn} />,
              })}
              .
            </small>
          </p>
        )}
        <PlatformPicker setPlatform={this.redirectToDocs} showOther={false} />
        <DocsHelp>
          {tct(
            `For a complete list of client integrations, please see
             [docLink:our in-depth documentation].`,
            {docLink: <ExternalLink href="https://docs.sentry.io" />}
          )}
        </DocsHelp>
      </div>
    );
  }
}

const DsnValue = styled(p => (
  <code {...p}>
    <AutoSelectText>{p.children}</AutoSelectText>
  </code>
))`
  overflow: hidden;
`;

const DsnInfo = styled('div')`
  margin-bottom: ${space(3)};
`;

const DsnContainer = styled('div')`
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: ${space(1.5)} ${space(2)};
  align-items: center;
  margin-bottom: ${space(2)};
`;

const DocsHelp = styled('p')`
  margin-top: ${space(2)};
`;

export default withOrganization(ProjectInstallOverview);
