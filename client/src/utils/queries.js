import { gql } from '@apollo/client';

export const QUERY_TUTORIALS = gql`
  query getTutorials {
    tutorials {
        _id
        title
        author
        tags
        category
        steps 
    }
  }
`;

export const GET_USER = gql`
    query getUser {
        user {
            username
            email
            image
            token
        }
    }
`;


export const GET_CURRENT_STEP = gql`
    query GET_CURRENT_STEP($id: ID!) {
        room(_id: $id) {
            currentStep {
                comments {
                    content
                    author {
                        email
                    }
                }
            content
            }
        }
    }
`

export const GET_ROOM = gql`
    query GET_ROOM($roomId: ID!) {
        room(id: $roomId) {
            currentStep
            tutorial {
                title
                author {
                    username
                }
                steps {
                    content
                    comments {
                        content
                        author {
                            username
                        }
                    }
                }
                category {
                    name
                }
                tags {
                  name
                }
            }
            owner {
                email
            }
        }
    }
`
