export const CREATE_PRODUCT_MUTATION = `
  mutation createProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        metafields(first: 250) {
          edges {
            node {
              namespace
              key
              value
              valueType
              description
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_PRODUCT_QUERY = `
  query getProduct($id: ID!) {
    product(id: $id) {
      id
      title
      metafields(first: 250) {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            src
            altText
          }
        }
      }
      options {
        id
        name
        values
      }
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = `
  mutation updateProduct($id: ID!, $input: ProductInput!) {
    productUpdate(id: $id, input: $input) {
      product {
        id
        title
        metafields(first: 250) {
          edges {
            node {
              namespace
              key
              value
              valueType
              description
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = `
  mutation deleteProduct($id: ID!) {
    productDelete(id: $id) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;
