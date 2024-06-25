const { ne } = require('faker/lib/locales')
describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  //aula 15.4.1 - dia 25/06
  context('Hitting the real API', () => {
    beforeEach(() => {

      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
    }).as('getStories')
  
    cy.visit('/')
    cy.wait('@getStories')
    
    })
      
  it('shows 20 stories, then the next 20 after clicking "More" - refatorado', () => {
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: initialTerm,
        page: '1'
      }
    }).as('getNextStories')

    cy.get('.item').should('have.length', 20)

    cy.contains('More').click()
    cy.wait('@getNextStories')

    cy.get('.item').should('have.length', 40)
  })

    
    it('searches via the last searched term - refatorado', () => {
      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`
      ).as('getNewTermStories')

      cy.get('#search')
        .clear()
        .type(`${newTerm}{enter}`)

      cy.wait('@getNewTermStories')

      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

      cy.wait('@getStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', initialTerm)
      cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })    
  })

  context.only('Mocking the API', () => {
    context('Footer and List of stories', ()=>{
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          {fixture: 'stories'}
        ).as('getStories')
    
        cy.visit('/')
        cy.wait('@getStories')
      })
    
      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })
    
      context('List of stories', () => {
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I assert on the data?
        // This is why this test is being skipped.
        // TODO: Find a way to test it out.
        it.skip('shows the right data for all rendered stories', () => {})
    
    
        it('shows one less story after dimissing the first story', () => {
          cy.get('.button-small')
            .first()
            .click()
    
          cy.get('.item').should('have.length', 1)
        })
    
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context.skip('Order by', () => {
          it('orders by title', () => {})
    
          it('orders by author', () => {})
    
          it('orders by comments', () => {})
    
          it('orders by points', () => {})
        })
      })

    })
  
    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          {fixture: 'empty'}
        ).as('getEmptyStories')

        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`,
          {fixture: 'stories'}
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')
  
        cy.get('#search')
          .clear()
      })
  
      it('types and hits ENTER - refatorado', () => {
  
        cy.get('#search')
          .type(`${newTerm}{enter}`)
  
        cy.wait('@getStories')
  
        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      it('types and clicks the submit button - refatorado', () => {
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()
  
        cy.wait('@getStories')
  
        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
  
      it('types and submits the form directly', () => {
        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(newTerm)
        cy.get('form').submit()
        cy.wait('@getNewTermStories')
  
        cy.get('.item').should('have.length', 20)
      })
  
      context('Last searches', () => {              
        Cypress._.times(5, () => {
          it.only('shows a max of 5 buttons for the last searched terms - reaftorado', () => {
            const faker = require('faker')
    
            cy.intercept(
              'GET',
              '**/search**',
              {fixture: 'empty'}
            ).as('getRandomStories')
    
            Cypress._.times(6, () => {
              cy.get('#search')
                .clear()
                .type(`${faker.random.word()}{enter}`)          
              cy.wait('@getRandomStories')  
            })  
            cy.get('.last-searches button')
              .should('have.length', 5)
          })
        })      
      })
    }) 

  })
  

 
})

context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept (
      'GET',
      '**/search**',
      {statusCode: 500}
    ).as ('getServerFailure')
    cy.visit('/')
    cy.wait('@getServerFailure')
    cy.get('p:contains(Something went wrong ...)')
      .should('be.visible')
  })
   

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept (
      'GET',
      '**/search**',
      { forceNetworkError: true }
    ).as('getNetWorkError')

    cy.visit('/')
    cy.wait('@getNetWorkError')

    cy.get('p:contains(Something went wrong ...)')  
      .should('be.visible')

  })

})
