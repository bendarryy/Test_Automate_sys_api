import Header from '../../../../shared/componanets/Header';

const HomePage = () => {
  return (
    <div>
      <Header 
        title="Supermarket Dashboard" 
        breadcrumbs={[
          { title: 'Supermarket' }
        ]}
      />
    </div>
  )
}

export default HomePage
