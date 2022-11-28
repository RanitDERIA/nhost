import { describe, expect, it } from 'vitest'

import { NhostClient } from '../src'

const nhost = new NhostClient({
  subdomain: 'localhost'
})

type User = { id: string; displayName: string }

describe('main tests', () => {
  it('getUrl()', () => {
    const graphqlUrl = nhost.graphql.getUrl()

    expect(graphqlUrl).toBe('http://localhost:1337/v1/graphql')
  })

  it('getHttpUrl()', async () => {
    const graphqlUrl = nhost.graphql.getHttpUrl()

    expect(graphqlUrl).toBe('http://localhost:1337/v1/graphql')
  })

  it('getWsUrl()', () => {
    const graphqlUrl = nhost.graphql.getWsUrl()

    expect(graphqlUrl).toBe('ws://localhost:1337/v1/graphql')
  })

  it('GraphQL request as logged out user', () => {
    const document = `
      query {
        users {
          id
          displayName
        }
      }
    `

    expect(() => nhost.graphql.request<{ users: User[] }>(document)).rejects.toThrowError()
  })

  it('GraphQL request as admin', async () => {
    const document = `
      query {
        users {
          id
          displayName
        }
      }
    `
    const data = await nhost.graphql.request<{ users: User[] }>(
      document,
      {},
      {
        'x-hasura-admin-secret': 'nhost-admin-secret'
      }
    )

    expect(data).toBeTruthy()
  })

  it('GraphQL with variables', async () => {
    const document = `
      query ($id: uuid!) {
        user (id: $id) {
          id
          displayName
        }
      }
    `
    const data = await nhost.graphql.request<{ user: User }, { id: string }>(
      document,
      {
        id: '5ccdb471-8ab2-4441-a3d1-f7f7146dda0c'
      },
      {
        'x-hasura-admin-secret': 'nhost-admin-secret'
      }
    )

    expect(data).toBeTruthy()
  })

  it('GraphQL with incorrect variables', () => {
    const document = `
      query ($id: uuid!) {
        user (id: $id) {
          id
          displayName
        }
      }
    `

    expect(() =>
      nhost.graphql.request<{ user: User }, { id: string }>(
        document,
        {
          id: 'not-a-uuid'
        },
        {
          'x-hasura-admin-secret': 'nhost-admin-secret'
        }
      )
    ).rejects.toThrowError()
  })

  it('GraphQL with missing variables', () => {
    const document = `
      query ($id: uuid!) {
        user (id: $id) {
          id
          displayName
        }
      }
    `

    expect(() =>
      nhost.graphql.request<{ user: User }>(
        document,
        {},
        {
          'x-hasura-admin-secret': 'nhost-admin-secret'
        }
      )
    ).rejects.toThrowError()
  })
})
