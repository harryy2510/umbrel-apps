import{b as R,eg as O,n as j,m as N,am as q,a5 as A,e as M,j as e,B as h,a8 as z,S as f,g as y,t as w,u as V,a as W,b7 as oe,bT as se,d9 as ie,T as $,v as ne,eh as K,ei as Q,A as X,ej as ce,aM as le,dI as de,ek as pe,el as ue,x as me,D as he,at as S,bf as ge,em as fe,f as ye,C as be,P as xe,h as ve,i as je,O as ze,ag as Ce}from"./index-D4F7dAoF.js";import{C as Pe}from"./index-CG8TlifH.js";import{S as D}from"./stepper-CUM1QXhW.js";import{f as Se,s as we}from"./repositoryPicker-D2v1sKVt.js";import{w as Y,d as L}from"./utils-D7NH7OYj.js";import"./useLocalStorage-BVim5TF6.js";let ke=[{name:"Linear",remoteUrl:"https://mcp.linear.app/mcp",type:"oauth",protocol:"streamable_http"},{name:"Neon",remoteUrl:"https://mcp.neon.tech/mcp",type:"oauth",protocol:"streamable_http"},{name:"Apify",remoteUrl:"https://mcp.apify.com",type:"oauth",protocol:"streamable_http"},{name:"monday.com",remoteUrl:"https://mcp.monday.com/mcp",type:"oauth",protocol:"streamable_http"},{name:"Notion",remoteUrl:"https://mcp.notion.com/mcp",type:"oauth",protocol:"streamable_http"},{name:"Prisma",remoteUrl:"https://mcp.prisma.io/mcp",type:"oauth",protocol:"streamable_http"},{name:"Sentry",remoteUrl:"https://mcp.sentry.dev/mcp",type:"oauth",protocol:"streamable_http"},{name:"Cloudflare Workers",remoteUrl:"https://bindings.mcp.cloudflare.com/mcp",type:"oauth",protocol:"streamable_http"},{name:"Square",remoteUrl:"https://mcp.squareup.com/mcp",type:"oauth",protocol:"streamable_http"},{name:"Webflow",remoteUrl:"https://mcp.webflow.com/sse",type:"oauth",protocol:"sse"},{name:"PayPal",remoteUrl:"https://mcp.paypal.com/sse",type:"oauth",protocol:"sse"},{name:"Jam",remoteUrl:"https://mcp.jam.dev/mcp",type:"oauth",protocol:"sse"}].map(t=>{let s=new URL(t.remoteUrl),n=s.hostname.split(".").slice(-2).join("."),m=`${s.protocol}//${n}`;return{...t,imageUrl:`https://favicons.metorial-cdn.com/?url=${encodeURIComponent(m)}`}}),Te=t=>({filename:"package.json",content:`${JSON.stringify({name:t,private:!0,type:"module",version:"1.0.0",main:"index.ts",dependencies:{"@metorial/mcp":"latest","@metorial/mcp-server":"latest",zod:"latest"}},null,2)}
`}),v=(t,s)=>[{filename:"index.ts",content:s.trimStart()},Te(t)],Ie=[{id:"basic-tools",slug:"basic-tools",name:"Basic Tools",category:"Basic",description:"Simple tools with typed inputs and outputs.",icon:"tools",files:v("basic-tools-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createMcpServer } from '@metorial/mcp-server';
import z from 'zod';

let add = McpTool.create('add', {
  description: 'Add two numbers.'
})
  .input(
    z.object({
      a: z.number(),
      b: z.number()
    })
  )
  .output(
    z.object({
      result: z.number()
    })
  )
  .handle(async input => ({ result: input.a + input.b }));

let stringify = McpTool.create('stringify', {
  description: 'Format any JSON value as a string.'
})
  .input(
    z.object({
      data: z.any()
    })
  )
  .output(
    z.object({
      result: z.string()
    })
  )
  .handle(async input => ({ result: JSON.stringify(input.data, null, 2) }));

let timestamp = McpTool.create('timestamp', {
  description: 'Return the current ISO timestamp.'
})
  .output(
    z.object({
      now: z.string()
    })
  )
  .handle(async () => ({ now: new Date().toISOString() }));

export let server = createMcpServer({
  name: 'Basic Tools',
  version: '1.0.0',
  tools: [add, stringify, timestamp]
});

export default server;
`)},{id:"http-api-client",slug:"http-api-client",name:"HTTP API Client",category:"API",description:"Connect to any JSON REST API over HTTP.",icon:"http",files:v("http-api-client-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    baseUrl: z.string().url(),
    apiKey: z.string().optional(),
    authorizationHeader: z.string().optional()
  })
);

let headers = () => {
  let h: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };

  if (config.apiKey) {
    h[config.authorizationHeader || 'Authorization'] = config.apiKey;
  }

  return h;
};

let apiUrl = (path: string) => new URL(path, config.baseUrl).toString();

let getJson = McpTool.create('getJson', {
  description: 'Send a GET request and return JSON.'
})
  .input(
    z.object({
      path: z.string()
    })
  )
  .output(z.object({ data: z.any() }))
  .handle(async input => {
    let res = await fetch(apiUrl(input.path), { headers: headers() });
    if (!res.ok) throw new Error('GET request failed: ' + res.statusText);
    return { data: await res.json() };
  });

let postJson = McpTool.create('postJson', {
  description: 'Send a POST request with a JSON body.'
})
  .input(
    z.object({
      path: z.string(),
      body: z.any()
    })
  )
  .output(z.object({ data: z.any() }))
  .handle(async input => {
    let res = await fetch(apiUrl(input.path), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(input.body)
    });
    if (!res.ok) throw new Error('POST request failed: ' + res.statusText);
    return { data: await res.json() };
  });

let healthCheck = McpTool.create('healthCheck', {
  description: 'Check whether the configured API is reachable.'
})
  .output(z.object({ ok: z.boolean(), status: z.number() }))
  .handle(async () => {
    let res = await fetch(apiUrl('/'), { headers: headers() });
    return { ok: res.ok, status: res.status };
  });

export let server = createMcpServer({
  name: 'HTTP API Client',
  version: '1.0.0',
  tools: [getJson, postJson, healthCheck],
  config
});

export default server;
`)},{id:"config-basics",slug:"config-basics",name:"Config Basics",category:"Basic",description:"Read custom config values from tools.",icon:"config",files:v("config-basics-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    workspaceName: z.string(),
    defaultLimit: z.number(),
    enabledFeatures: z.array(z.string())
  })
);

let showConfig = McpTool.create('showConfig')
  .output(
    z.object({
      workspaceName: z.string(),
      defaultLimit: z.number(),
      enabledFeatures: z.array(z.string())
    })
  )
  .handle(async () => ({
    workspaceName: config.workspaceName,
    defaultLimit: config.defaultLimit,
    enabledFeatures: config.enabledFeatures
  }));

let featureEnabled = McpTool.create('featureEnabled')
  .input(z.object({ feature: z.string() }))
  .output(z.object({ enabled: z.boolean() }))
  .handle(async input => ({
    enabled: config.enabledFeatures.includes(input.feature)
  }));

let formatGreeting = McpTool.create('formatGreeting')
  .input(z.object({ name: z.string() }))
  .output(z.object({ message: z.string() }))
  .handle(async input => ({
    message: 'Hello ' + input.name + ' from ' + config.workspaceName + '.'
  }));

export let server = createMcpServer({
  name: 'Config Basics',
  version: '1.0.0',
  tools: [showConfig, featureEnabled, formatGreeting],
  config
});

export default server;
`)},{id:"oauth-basics",slug:"oauth-basics",name:"OAuth Basics",category:"OAuth",description:"A minimal OAuth 2.0 HTTP API template.",icon:"oauth",files:v("oauth-basics-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer, createOAuth } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    apiBaseUrl: z.string().url()
  })
);

let authConfig = createOAuth(
  z.object({
    authorizationUrl: z.string().url(),
    tokenUrl: z.string().url(),
    scope: z.string()
  }),
  {
    getAuthorizationUrl: async ctx => {
      let url = new URL(ctx.authConfig.authorizationUrl);
      url.searchParams.set('client_id', ctx.clientId);
      url.searchParams.set('redirect_uri', ctx.redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', ctx.authConfig.scope);
      url.searchParams.set('state', ctx.state);
      return url.toString();
    },
    handleCallback: async ctx => {
      let res = await fetch(ctx.authConfig.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: ctx.code,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!res.ok) throw new Error('Token exchange failed: ' + res.statusText);
      let data = await res.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
        tokenType: data.token_type
      };
    }
  }
);

let getProfile = McpTool.create('getProfile')
  .output(z.object({ data: z.any() }))
  .handle(async () => {
    let res = await fetch(new URL('/me', config.apiBaseUrl), {
      headers: { Authorization: 'Bearer ' + authConfig.accessToken }
    });
    if (!res.ok) throw new Error('Profile request failed: ' + res.statusText);
    return { data: await res.json() };
  });

let getTokenInfo = McpTool.create('getTokenInfo')
  .output(
    z.object({
      tokenType: z.string().optional(),
      scope: z.string().optional(),
      expiresIn: z.number().optional()
    })
  )
  .handle(async () => ({
    tokenType: authConfig.tokenType,
    scope: authConfig.scope,
    expiresIn: authConfig.expiresIn
  }));

export let server = createMcpServer({
  name: 'OAuth Basics',
  version: '1.0.0',
  tools: [getProfile, getTokenInfo],
  config,
  authConfig
});

export default server;
`)},{id:"slack-workspace",slug:"slack-workspace",name:"Slack",category:"Productivity",description:"List channels, post messages, and search Slack.",imageUrl:"https://provider-logos.metorial-cdn.com/slack.svg",files:v("slack-workspace-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer, createOAuth } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    defaultChannelId: z.string().optional()
  })
);

let authConfig = createOAuth({
  getAuthorizationUrl: async ctx => {
    let url = new URL('https://slack.com/oauth/v2/authorize');
    url.searchParams.set('client_id', ctx.clientId);
    url.searchParams.set('redirect_uri', ctx.redirectUri);
    url.searchParams.set('state', ctx.state);
    url.searchParams.set('scope', 'channels:read chat:write search:read');
    return url.toString();
  },
  handleCallback: async ctx => {
    let res = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri
      })
    });
    let data = await res.json();
    if (!res.ok || !data.ok) throw new Error('Slack OAuth failed: ' + (data.error || res.statusText));
    return {
      accessToken: data.access_token,
      scope: data.scope,
      tokenType: data.token_type
    };
  }
});

let slackFetch = async (path: string, init: RequestInit = {}) => {
  let res = await fetch('https://slack.com/api/' + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + authConfig.accessToken,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  let data = await res.json();
  if (!res.ok || data.ok === false) throw new Error('Slack API failed: ' + (data.error || res.statusText));
  return data;
};

let listChannels = McpTool.create('listChannels')
  .output(z.object({ channels: z.any() }))
  .handle(async () => ({
    channels: (await slackFetch('conversations.list?types=public_channel,private_channel')).channels
  }));

let postMessage = McpTool.create('postMessage')
  .input(z.object({ channelId: z.string().optional(), text: z.string() }))
  .output(z.object({ ok: z.boolean(), ts: z.string().optional() }))
  .handle(async input => {
    let data = await slackFetch('chat.postMessage', {
      method: 'POST',
      body: JSON.stringify({
        channel: input.channelId || config.defaultChannelId,
        text: input.text
      })
    });
    return { ok: true, ts: data.ts };
  });

let searchMessages = McpTool.create('searchMessages')
  .input(z.object({ query: z.string() }))
  .output(z.object({ messages: z.any() }))
  .handle(async input => ({
    messages: (await slackFetch('search.messages?query=' + encodeURIComponent(input.query))).messages
  }));

export let server = createMcpServer({
  name: 'Slack Workspace',
  version: '1.0.0',
  tools: [listChannels, postMessage, searchMessages],
  config,
  authConfig
});

export default server;
`)},{id:"gmail-assistant",slug:"gmail-assistant",name:"Gmail",category:"Productivity",description:"Search Gmail and create drafts.",imageUrl:"https://provider-logos.metorial-cdn.com/gmail.svg",files:v("gmail-assistant-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer, createOAuth } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    defaultFrom: z.string().email().optional(),
    labelIds: z.array(z.string()).optional()
  })
);

let authConfig = createOAuth({
  getAuthorizationUrl: async ctx => {
    let url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', ctx.clientId);
    url.searchParams.set('redirect_uri', ctx.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', ctx.state);
    url.searchParams.set('scope', [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose'
    ].join(' '));
    return url.toString();
  },
  handleCallback: async ctx => {
    let res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        grant_type: 'authorization_code'
      })
    });
    if (!res.ok) throw new Error('Google token exchange failed: ' + res.statusText);
    let data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
      tokenType: data.token_type
    };
  }
});

let gmailFetch = async (path: string, init: RequestInit = {}) => {
  let res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/' + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + authConfig.accessToken,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!res.ok) throw new Error('Gmail API failed: ' + res.statusText);
  return res.json();
};

let encodeBase64Url = (value: string) =>
  Buffer.from(value).toString('base64').replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '');

let searchMessages = McpTool.create('searchMessages')
  .input(z.object({ query: z.string(), maxResults: z.number().optional() }))
  .output(z.object({ messages: z.any() }))
  .handle(async input => ({
    messages: (await gmailFetch('messages?' + new URLSearchParams({
      q: input.query,
      maxResults: String(input.maxResults || 10)
    }))).messages || []
  }));

let getMessage = McpTool.create('getMessage')
  .input(z.object({ messageId: z.string() }))
  .output(z.object({ message: z.any() }))
  .handle(async input => ({
    message: await gmailFetch('messages/' + input.messageId + '?format=full')
  }));

let createDraft = McpTool.create('createDraft')
  .input(z.object({ to: z.string().email(), subject: z.string(), body: z.string() }))
  .output(z.object({ draft: z.any() }))
  .handle(async input => {
    let from = config.defaultFrom ? 'From: ' + config.defaultFrom + '\\n' : '';
    let raw = encodeBase64Url(from + 'To: ' + input.to + '\\nSubject: ' + input.subject + '\\n\\n' + input.body);
    return {
      draft: await gmailFetch('drafts', {
        method: 'POST',
        body: JSON.stringify({ message: { raw } })
      })
    };
  });

export let server = createMcpServer({
  name: 'Gmail Assistant',
  version: '1.0.0',
  tools: [searchMessages, getMessage, createDraft],
  config,
  authConfig
});

export default server;
`)},{id:"github-issues",slug:"github-issues",name:"GitHub",category:"Developer",description:"List, create, and comment on GitHub issues.",imageUrl:"https://provider-logos.metorial-cdn.com/github.png",files:v("github-issues-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    owner: z.string(),
    repo: z.string(),
    apiToken: z.string()
  })
);

let githubFetch = async (path: string, init: RequestInit = {}) => {
  let res = await fetch('https://api.github.com/repos/' + config.owner + '/' + config.repo + path, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + config.apiToken,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!res.ok) throw new Error('GitHub API failed: ' + res.statusText);
  return res.json();
};

let listIssues = McpTool.create('listIssues')
  .input(z.object({ state: z.enum(['open', 'closed', 'all']).optional() }))
  .output(z.object({ issues: z.any() }))
  .handle(async input => ({
    issues: await githubFetch('/issues?state=' + (input.state || 'open'))
  }));

let createIssue = McpTool.create('createIssue')
  .input(z.object({ title: z.string(), body: z.string().optional() }))
  .output(z.object({ issue: z.any() }))
  .handle(async input => ({
    issue: await githubFetch('/issues', {
      method: 'POST',
      body: JSON.stringify(input)
    })
  }));

let commentOnIssue = McpTool.create('commentOnIssue')
  .input(z.object({ issueNumber: z.number(), body: z.string() }))
  .output(z.object({ comment: z.any() }))
  .handle(async input => ({
    comment: await githubFetch('/issues/' + input.issueNumber + '/comments', {
      method: 'POST',
      body: JSON.stringify({ body: input.body })
    })
  }));

export let server = createMcpServer({
  name: 'GitHub Issues',
  version: '1.0.0',
  tools: [listIssues, createIssue, commentOnIssue],
  config
});

export default server;
`)},{id:"notion-database",slug:"notion-database",name:"Notion",category:"Productivity",description:"Query databases and create pages in Notion.",imageUrl:"https://provider-logos.metorial-cdn.com/notion.svg",files:v("notion-database-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    databaseId: z.string(),
    integrationToken: z.string()
  })
);

let notionFetch = async (path: string, init: RequestInit = {}) => {
  let res = await fetch('https://api.notion.com/v1/' + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + config.integrationToken,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
      ...(init.headers || {})
    }
  });
  if (!res.ok) throw new Error('Notion API failed: ' + res.statusText);
  return res.json();
};

let queryDatabase = McpTool.create('queryDatabase')
  .input(z.object({ filter: z.any().optional() }))
  .output(z.object({ results: z.any() }))
  .handle(async input => ({
    results: (await notionFetch('databases/' + config.databaseId + '/query', {
      method: 'POST',
      body: JSON.stringify({ filter: input.filter })
    })).results
  }));

let createPage = McpTool.create('createPage')
  .input(z.object({ title: z.string() }))
  .output(z.object({ page: z.any() }))
  .handle(async input => ({
    page: await notionFetch('pages', {
      method: 'POST',
      body: JSON.stringify({
        parent: { database_id: config.databaseId },
        properties: {
          Name: {
            title: [{ text: { content: input.title } }]
          }
        }
      })
    })
  }));

let appendBlock = McpTool.create('appendBlock')
  .input(z.object({ pageId: z.string(), text: z.string() }))
  .output(z.object({ block: z.any() }))
  .handle(async input => ({
    block: await notionFetch('blocks/' + input.pageId + '/children', {
      method: 'PATCH',
      body: JSON.stringify({
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: input.text } }]
            }
          }
        ]
      })
    })
  }));

export let server = createMcpServer({
  name: 'Notion Database',
  version: '1.0.0',
  tools: [queryDatabase, createPage, appendBlock],
  config
});

export default server;
`)},{id:"linear-project-helper",slug:"linear-project-helper",name:"Linear",category:"Productivity",description:"Manage Linear issues with GraphQL.",imageUrl:"https://provider-logos.metorial-cdn.com/linear.png",files:v("linear-project-helper-mcp-server",`
import { McpTool } from '@metorial/mcp';
import { createConfig, createMcpServer } from '@metorial/mcp-server';
import z from 'zod';

let config = createConfig(
  z.object({
    apiKey: z.string(),
    teamId: z.string().optional()
  })
);

let linearGraphql = async (query: string, variables: Record<string, any> = {}) => {
  let res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: config.apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  let data = await res.json();
  if (!res.ok || data.errors) throw new Error('Linear API failed: ' + JSON.stringify(data.errors || data));
  return data.data;
};

let listIssues = McpTool.create('listIssues')
  .input(z.object({ query: z.string().optional() }))
  .output(z.object({ issues: z.any() }))
  .handle(async input => ({
    issues: (await linearGraphql(
      'query Issues($query: String) { issues(filter: { title: { containsIgnoreCase: $query } }, first: 20) { nodes { id identifier title state { name } url } } }',
      { query: input.query || '' }
    )).issues.nodes
  }));

let createIssue = McpTool.create('createIssue')
  .input(z.object({ title: z.string(), description: z.string().optional(), teamId: z.string().optional() }))
  .output(z.object({ issue: z.any() }))
  .handle(async input => ({
    issue: (await linearGraphql(
      'mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { issue { id identifier title url } } }',
      { input: { title: input.title, description: input.description, teamId: input.teamId || config.teamId } }
    )).issueCreate.issue
  }));

let updateIssueStatus = McpTool.create('updateIssueStatus')
  .input(z.object({ issueId: z.string(), stateId: z.string() }))
  .output(z.object({ issue: z.any() }))
  .handle(async input => ({
    issue: (await linearGraphql(
      'mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { issue { id identifier title state { name } url } } }',
      { id: input.issueId, input: { stateId: input.stateId } }
    )).issueUpdate.issue
  }));

export let server = createMcpServer({
  name: 'Linear Project Helper',
  version: '1.0.0',
  tools: [listIssues, createIssue, updateIssueStatus],
  config
});

export default server;
`)}],Me=t=>t.files.map(s=>({...s})),Fe={getLaunchParams:`(config, ctx) => ({
  command: 'npm',
  args: ['run', 'start'],
  env: {}
});`},H=y.div.withConfig({displayName:"createDockerForm__Actions",componentId:"sc-19evb-0"})(["display:flex;gap:10px;justify-content:flex-end;margin-top:10px;"]),Ue=y.div.withConfig({displayName:"createDockerForm__Form",componentId:"sc-19evb-1"})(["display:flex;flex-direction:column;"]),Re=t=>{let s=R(),n=O(),[m,c]=j.useState(0),u=N(),r=q({initialValues:{name:"",dockerImage:"",description:"",metadata:{},getLaunchParams:Fe.getLaunchParams},schema:i=>i.object({name:i.string().required("Name is required"),dockerImage:i.string().required("Docker Image URL is required"),getLaunchParams:i.string().required("Launch Parameters are required"),description:i.string().optional(),metadata:i.object().optional()}),onSubmit:async i=>{if(!s.data)return;let[p]=await n.mutate({instanceId:s.data.id,name:i.name,description:i.description,from:{type:"container",imageRef:i.dockerImage}});p&&(A.success("Custom MCP server created successfully"),t.onCreate?t.onCreate(p):u(M.instance.customProvider(s.data.organization,s.data.project,s.data,p.id),{state:{category:"custom"}}))}}),b=t.close&&e.jsx(h,{type:"button",variant:"outline",onClick:t.close,disabled:n.isLoading,size:"2",children:"Close"}),o=async()=>{r.setFieldTouched("dockerImage",!0,!1),r.setFieldTouched("getLaunchParams",!0,!1);let i=await r.validateForm();i.dockerImage||i.getLaunchParams||c(1)};return e.jsxs(Ue,{children:[e.jsx(D,{currentStep:m,setCurrentStep:c,steps:[{title:"Docker Image",subtitle:"Enter the Docker image URL",render:()=>e.jsxs("form",{onSubmit:i=>{i.preventDefault(),o()},children:[e.jsx(z,{label:"Docker Image",description:"The Docker image URL for your custom MCP server.",placeholder:"e.g. ghcr.io/metorial/mcp-server:latest",...r.getFieldProps("dockerImage")}),e.jsx(r.RenderError,{field:"dockerImage"}),e.jsx(f,{size:15}),e.jsx(Pe,{label:"Start Command",lang:"javascript",description:"Define the environment variables and arguments for starting the Docker container.",value:r.values.getLaunchParams,onChange:i=>r.setFieldValue("getLaunchParams",i),height:"200px"}),e.jsx(r.RenderError,{field:"getLaunchParams"}),e.jsxs(H,{children:[b,e.jsx(h,{type:"submit",size:"2",children:"Continue"})]})]})},{title:"Finish",subtitle:"Review and create the Docker MCP server",render:()=>e.jsxs("form",{onSubmit:r.handleSubmit,children:[e.jsx(z,{label:"Name",...r.getFieldProps("name"),autoFocus:!0}),e.jsx(r.RenderError,{field:"name"}),e.jsx(f,{size:15}),e.jsx(z,{label:"Description",...r.getFieldProps("description")}),e.jsx(r.RenderError,{field:"description"}),e.jsxs(H,{children:[b,e.jsx(h,{loading:n.isLoading,success:n.isSuccess,type:"submit",size:"2",children:"Create Docker MCP Server"})]})]})}]}),n.error&&e.jsx(n.RenderError,{})]})},Z=y.div.withConfig({displayName:"createFormShared__Form",componentId:"sc-1almlfl-0"})(["display:flex;flex-direction:column;"]),ee=y.div.withConfig({displayName:"createFormShared__TemplateWrapper",componentId:"sc-1almlfl-1"})(["display:flex;flex-direction:column;gap:5px;"]),U=y.div.withConfig({displayName:"createFormShared__Actions",componentId:"sc-1almlfl-2"})(["display:flex;gap:10px;justify-content:flex-end;margin-top:10px;"]),te=y.div.withConfig({displayName:"createFormShared__Templates",componentId:"sc-1almlfl-3"})(["display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;"]),re=y.button.withConfig({displayName:"createFormShared__TemplatesItem",componentId:"sc-1almlfl-4"})(["display:flex;align-items:center;padding:10px;background:none;border:"," 1px solid;border-radius:8px;text-align:left;gap:10px;span{font-size:14px;font-weight:600;color:",";}"],w.colors.gray300,w.colors.gray800),_e=y.div.withConfig({displayName:"createFormShared__TemplateIconFrame",componentId:"sc-1almlfl-5"})(["width:24px;height:24px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:",";"],w.colors.gray800),Le=y.div.withConfig({displayName:"createManagedForm__RepositorySourceCard",componentId:"sc-6z16c6-0"})(["display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px;border:1px solid ",";border-radius:10px;background:",";"],w.colors.gray300,w.colors.gray100),Oe=y.div.withConfig({displayName:"createManagedForm__RepositorySourceDetails",componentId:"sc-6z16c6-1"})(["display:flex;align-items:center;gap:11px;min-width:0;"]),Ne=y.div.withConfig({displayName:"createManagedForm__RepositorySourceIcon",componentId:"sc-6z16c6-2"})(["width:36px;height:36px;display:grid;place-items:center;flex:none;border-radius:8px;background:",";color:",";"],w.colors.gray200,w.colors.gray700),qe=({template:t})=>{if(t.imageUrl)return e.jsx(X,{entity:t,size:24,imageFit:"contain"});let s=t.icon==="http"?e.jsx(ce,{size:20}):t.icon==="config"?e.jsx(le,{size:20}):t.icon==="oauth"?e.jsx(de,{size:20}):t.icon==="tools"?e.jsx(pe,{size:20}):e.jsx(ue,{size:20});return e.jsx(_e,{children:s})},Ae=t=>{let s=R(),n=V(),m=W();oe();let c=O(),u={data:{items:Ie}},[r,b]=j.useState(void 0),o=r==null?void 0:r.id,i=N(),[p,a]=j.useState(void 0),[g,x]=j.useState(0),d=q({initialValues:{name:"",description:"",metadata:{},path:""},schema:l=>l.object({name:l.string().required("Name is required"),description:l.string().optional(),metadata:l.object().optional(),path:l.string().optional()}),onSubmit:async l=>{var J;if(!s.data)return;let k={identifier:"nodejs",version:"22.x"},T=((J=l.path)==null?void 0:J.trim())||void 0,F=u.data.items.find(I=>I.id===p||I.slug===p)??u.data.items[0],[P]=await c.mutate({instanceId:s.data.id,name:l.name,description:l.description,from:r?{type:"function",env:{},runtime:k,repository:{repositoryId:r.id,branch:r.defaultBranch||"main",path:T}}:{type:"function",files:Me(F),env:{},runtime:k}});if(P){let I=await Y(async()=>{var G;let[_]=await Q({limit:1,instanceId:s.data.id,customProviderId:P.id});return(G=_==null?void 0:_.items[0])==null?void 0:G.id});A.success("Custom MCP server created successfully"),t.onCreate?t.onCreate(P):i(M.instance.customProvider(s.data.organization,s.data.project,s.data,P.id,...I?["versions",{version_id:I}]:[]),{state:{category:"custom"}})}}}),C=t.close&&e.jsx(h,{type:"button",variant:"outline",onClick:t.close,disabled:c.isLoading,size:"2",children:"Close"}),E=(l,k)=>{var F;let T=(F=u.data)==null?void 0:F.items.find(P=>P.id===l||P.slug===l);T&&(d.resetForm(),d.setFieldValue("name",T.name),d.setFieldValue("description",T.description),a(T.id),b(void 0),k!=null&&k.advance&&x(1))},B=j.useRef(!1);if(j.useEffect(()=>{!t.templateId||!u.data||B.current||(B.current=!0,E(t.templateId,{advance:!0}))},[t.templateId,u.data]),t.templateId&&!p)return e.jsx(se,{});let ae=()=>{!r&&!p||x(1)};return e.jsxs(Z,{children:[e.jsx(D,{currentStep:g,setCurrentStep:x,steps:[{title:"Setup",subtitle:"Choose a source",render:()=>e.jsx("form",{onSubmit:l=>{l.preventDefault(),ae()},children:e.jsxs(ee,{children:[e.jsxs(Le,{children:[e.jsxs(Oe,{children:[e.jsx(Ne,{children:e.jsx(ie,{size:18})}),e.jsxs("div",{style:{minWidth:0},children:[e.jsx($,{size:"2",weight:"strong",children:r?`${r.provider.owner}/${r.provider.name}`:"Import from a Git repository"}),e.jsx($,{size:"1",color:"gray600",children:r?r.url:"Choose an existing repository or create a new one."}),r&&e.jsxs(e.Fragment,{children:[e.jsx(f,{size:4}),e.jsx(ne,{color:"gray",size:"1",children:Se(r.provider.type)})]})]})]}),e.jsx(h,{type:"button",size:"2",variant:r?"outline":"solid",onClick:()=>{s.data&&we({instanceId:s.data.id,selectedExternalRepoId:r==null?void 0:r.provider.id,allowCreate:!0,onManageSourceControl:()=>{!n.data||!m.data||(window.location.href=`/o/${n.data.slug}/project/${m.data.slug}/scm`)},onSelect:l=>{b(l),d.resetForm(),d.setFieldValue("name",l.provider.name),a(void 0)}})},children:r?"Change":"Select repository"})]}),e.jsx(f,{size:10}),e.jsx(K,{text:"OR"}),e.jsx(f,{size:10}),e.jsx(te,{children:u.data.items.map(l=>e.jsxs(re,{type:"button",onClick:()=>E(l.id,{advance:!0}),children:[e.jsx(qe,{template:l}),e.jsx("span",{children:l.name})]},l.id))}),e.jsxs(U,{children:[C,e.jsx(h,{type:"submit",size:"2",disabled:!r&&!p,children:"Continue"})]})]})})},{title:"Finish",subtitle:"Review and create the custom MCP server",render:()=>e.jsxs("form",{onSubmit:d.handleSubmit,children:[e.jsx(z,{label:"Name",...d.getFieldProps("name"),autoFocus:!0}),e.jsx(d.RenderError,{field:"name"}),e.jsx(f,{size:15}),e.jsx(z,{label:"Description",...d.getFieldProps("description")}),e.jsx(d.RenderError,{field:"description"}),o&&!p&&e.jsxs(e.Fragment,{children:[e.jsx(f,{size:15}),e.jsx(z,{label:"Path (optional)",description:"The path of the MCP server in the repository.",...d.getFieldProps("path"),placeholder:"e.g. ./my-server"}),e.jsx(d.RenderError,{field:"path"})]}),e.jsxs(U,{children:[C,e.jsx(h,{loading:c.isLoading,success:c.isSuccess,disabled:c.isLoading,type:"submit",size:"2",children:"Create Custom MCP Server"})]})]})}]}),c.error&&e.jsx(c.RenderError,{})]})},De=t=>{let s=R(),n=O(),[m,c]=j.useState(0),[u,r]=j.useState(!1),b=N(),o=q({initialValues:{name:"",remoteUrl:"",description:"",metadata:{},remoteProtocol:L("")},schema:a=>a.object({name:a.string().required("Name is required"),remoteUrl:a.string().url().required("Remote URL is required"),description:a.string().optional(),metadata:a.object().optional(),remoteProtocol:a.string().optional()}),onSubmit:async a=>{if(!s.data)return;let[g]=await n.mutate({instanceId:s.data.id,name:a.name,description:a.description,from:{type:"remote",remoteUrl:a.remoteUrl.trim(),protocol:a.remoteProtocol=="sse"?"sse":"streamable_http"}});if(g){let x=await Y(async()=>{var C;let[d]=await Q({limit:1,instanceId:s.data.id,customProviderId:g.id});return(C=d==null?void 0:d.items[0])==null?void 0:C.id});A.success("Remote MCP server linked successfully"),t.onCreate?t.onCreate(g):b(M.instance.customProvider(s.data.organization,s.data.project,s.data,g.id,...x?["versions",{version_id:x}]:[]),{state:{category:"external"}})}}});j.useEffect(()=>{if(u)return;let a=L(o.values.remoteUrl);o.values.remoteProtocol!==a&&o.setFieldValue("remoteProtocol",a)},[o.values.remoteProtocol,o.values.remoteUrl,u]);let i=async()=>{o.setFieldTouched("remoteUrl",!0,!1),o.setFieldTouched("remoteProtocol",!0,!1);let a=await o.validateForm();a.remoteUrl||a.remoteProtocol||c(1)},p=t.close&&e.jsx(h,{type:"button",variant:"outline",onClick:t.close,disabled:n.isLoading,size:"2",children:"Close"});return e.jsxs(Z,{children:[e.jsx(D,{currentStep:m,setCurrentStep:c,steps:[{title:"Remote URL",subtitle:"Enter the remote MCP server URL",render:()=>e.jsx("form",{onSubmit:a=>{a.preventDefault(),i()},children:e.jsxs(ee,{children:[e.jsx(z,{label:"Remote URL",description:"Enter the remote MCP server URL you want to connect to.",placeholder:"https://mcp.monday.com/sse",...o.getFieldProps("remoteUrl")}),e.jsx(o.RenderError,{field:"remoteUrl"}),e.jsx(f,{size:15}),e.jsx(me,{value:o.values.remoteProtocol,label:"MCP Transport Protocol",description:"Which transport protocol does your remote MCP server support?",items:[{label:"SSE (Server-Sent Events)",id:"sse"},{label:"Streamable HTTP",id:"streamable_http"}],onChange:a=>{r(!0),o.setFieldValue("remoteProtocol",a)}}),e.jsx(o.RenderError,{field:"remoteProtocol"}),e.jsx(f,{size:10}),e.jsx(K,{text:"OR"}),e.jsx(f,{size:10}),e.jsx(te,{children:ke.map(a=>e.jsxs(re,{type:"button",onClick:()=>{o.resetForm();let g=L(a.remoteUrl);r(!1),o.setFieldValue("remoteUrl",a.remoteUrl),o.setFieldValue("remoteProtocol",g),o.setFieldValue("name",a.name),c(1)},children:[e.jsx(X,{entity:a,size:24,imageFit:"contain"}),e.jsx("span",{children:a.name})]},a.remoteUrl))}),e.jsxs(U,{children:[p,e.jsx(h,{type:"submit",size:"2",children:"Continue"})]})]})})},{title:"Finish",subtitle:"Review and link the remote MCP server",render:()=>e.jsxs("form",{onSubmit:o.handleSubmit,children:[e.jsx(z,{label:"Name",...o.getFieldProps("name"),autoFocus:!0}),e.jsx(o.RenderError,{field:"name"}),e.jsx(f,{size:15}),e.jsx(z,{label:"Description",...o.getFieldProps("description")}),e.jsx(o.RenderError,{field:"description"}),e.jsxs(U,{children:[p,e.jsx(h,{loading:n.isLoading,success:n.isSuccess,type:"submit",size:"2",children:"Link Remote MCP Server"})]})]})}]}),n.error&&e.jsx(n.RenderError,{})]})},Ee=t=>he(({dialogProps:s,close:n})=>e.jsxs(S.Wrapper,{...s,width:650,children:[t.type=="remote"&&e.jsxs(e.Fragment,{children:[e.jsx(S.Title,{children:"Link Remote MCP Server"}),e.jsx(S.Description,{children:"Link a remote MCP server to Metorial."}),e.jsx(De,{...t,close:n,onCreate:t.onCreate})]}),t.type=="managed"&&e.jsxs(e.Fragment,{children:[e.jsx(S.Title,{children:"Create Custom MCP Server"}),e.jsx(S.Description,{children:"Create a new custom MCP server powered by Metorial."}),e.jsx(Ae,{...t,close:n,onCreate:t.onCreate})]}),t.type=="docker"&&e.jsxs(e.Fragment,{children:[e.jsx(S.Title,{children:"Create Docker MCP Server"}),e.jsx(S.Description,{children:"Deploy a custom Docker image as an MCP server on Metorial."}),e.jsx(Re,{...t,close:n,onCreate:t.onCreate})]})]})),We=()=>{let t=R(),s=V(),n=W(),m=ge(),c=fe(),u=ye().pathname,r=[s.data,n.data,t.data],b=u.endsWith("/external-providers"),o=b?{title:"Remote MCP Servers",description:"Connect to remote MCP servers using the Metorial platform.",actionLabel:"Link Remote MCP Server",actionType:"remote"}:{title:"Custom MCP Servers",description:"Build custom MCP servers powered by Metorial. Deploy them on your own infrastructure or use Metorial-managed infrastructure.",actionLabel:"Create Custom MCP Server",actionType:"managed"},i=a=>{a==="managed"&&!c.data||Ee({type:a})},p=()=>{var a,g,x,d;return b?!!((a=m.data)!=null&&a.flags["paid-custom-providers"])&&e.jsx(h,{onClick:()=>i(o.actionType),size:"2",children:o.actionLabel}):(g=m.data)!=null&&g.flags["paid-custom-docker-providers"]?e.jsx(Ce,{label:o.actionLabel,items:[{id:"docker",label:"Docker MCP Server",description:"Deploy a custom Docker image as an MCP server on Metorial."},{id:"managed",label:"Custom MCP Server",description:"Connect a GitHub repo and deploy a custom MCP server to Metorial automatically."}],onItemClick:C=>{if(C==="managed"){i(o.actionType);return}i("docker")},children:e.jsx(h,{size:"2",loading:c.isLoading,disabled:!c.data&&!c.isLoading,children:o.actionLabel})}):!!((x=m.data)!=null&&x.flags["custom-providers-enabled"]&&((d=m.data)!=null&&d.flags["paid-custom-providers"]))&&e.jsx(h,{onClick:()=>i(o.actionType),loading:c.isLoading,disabled:!c.data&&!c.isLoading,size:"2",children:o.actionLabel})};return e.jsxs(be,{children:[e.jsx(xe,{title:o.title,description:o.description,actions:p()}),e.jsx(ve,{current:u,links:[{label:"Remote MCP Server",to:M.instance.externalProviders(...r)},{label:"Custom MCP Server",to:M.instance.customProviders(...r)}]}),e.jsx(je,{enabled:!0,children:e.jsx(ze,{})})]})};export{We as CustomProvidersListLayout};
//# sourceMappingURL=_layout-BaD1xSUh.js.map
