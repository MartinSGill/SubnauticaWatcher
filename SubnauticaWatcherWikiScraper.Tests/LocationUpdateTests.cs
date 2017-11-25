namespace SubnauticaWatcherWikiScraper.Tests
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using SubnauticaWatcherWikiScraper;
    using Supremes;
    using Supremes.Nodes;
    using Xunit;

    public class LocationUpdateTests
    {
        [Fact]
        [Trait("Category", "Locations")]
        public void ExtractCoordinate_ShouldCorrectlyReturnLocation()
        {
            const string data = @"
<html>
<head></head>
<body>
<h2>Heading 1</h2>
<table>
<tr>
<td>1 2 3</td>
<td>Some Comment</td>
</tr>
</table>
<h2>Heading 2</h2>
<table>
</table>
</body>
</html>";
            var locations = LocationUpdate.ExtractCoordinates(data);
            Assert.Equal(1, locations.Count());
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ExtractCoordinateTables_ShouldCorrectlyFindHeadingText()
        {
            const string data =
                "\r\n<html>\r\n<head></head>\r\n<body>\r\n<h2>Heading 1</h2>\r\n<table>\r\n</table>\r\n<h2>Heading 2</h2>\r\n<table>\r\n</table>\r\n</body>\r\n</html>";
            var document = Dcsoup.Parse(data);
            var tableMap = LocationUpdate.ExtractCoordinateTables(document);

            Assert.Contains("Heading 1", tableMap.Select(t => t.Item1));
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ExtractCoordinateTables_ShouldCorrectlySubsequentHeadingText()
        {
            const string data =
                "\r\n<html>\r\n<head></head>\r\n<body>\r\n<h2>Heading 1</h2>\r\n<table>\r\n</table>\r\n<h2>Heading 2</h2>\r\n<table>\r\n</table>\r\n</body>\r\n</html>";
            var document = Dcsoup.Parse(data);
            var tableMap = LocationUpdate.ExtractCoordinateTables(document);

            Assert.Contains("Heading 2", tableMap.Select(t => t.Item1));
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ExtractCoordinateTables_ShouldFindAllLocationTables()
        {
            const string data =
                "\r\n<html>\r\n<head></head>\r\n<body>\r\n<h2>Heading 1</h2>\r\n<table>\r\n</table>\r\n<h2>Heading 2</h2>\r\n<table>\r\n</table>\r\n</body>\r\n</html>";
            var document = Dcsoup.Parse(data);
            var tableMap = LocationUpdate.ExtractCoordinateTables(document);

            Assert.Equal(2, tableMap.Count());
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ExtractCoordinateTables_ShouldReturnATable()
        {
            const string data =
                "\r\n<html>\r\n<head></head>\r\n<body>\r\n<h2>Heading 1</h2>\r\n<table>\r\n</table>\r\n<h2>Heading 2</h2>\r\n<table>\r\n</table>\r\n</body>\r\n</html>";
            var document = Dcsoup.Parse(data);
            var tableMap = LocationUpdate.ExtractCoordinateTables(document);

            Assert.True(tableMap.First().Item2.TagName == "table");
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ExtractCoordinateTables_ShouldReturnATable_WhenIntermediateSiblings()
        {
            const string data = @"
<html>
<head></head>
<body>
<h2>Heading 1</h2>
<p>Wibble</p>
<table>
</table>
<h2>Heading 2</h2>
<p>Wibble</p>
<p>Wibble2</p>
<table>
</table>
</body>
</html>";
            var document = Dcsoup.Parse(data);
            var tableMap = LocationUpdate.ExtractCoordinateTables(document);

            var enumerable = tableMap as IList<Tuple<string, Element>> ?? tableMap.ToList();
            Assert.True(enumerable.Any(), "No tables were returned.");
            Assert.True(enumerable.First().Item2.TagName == "table", "First result not a table.");
            Assert.True(enumerable.Skip(1).First().Item2.TagName == "table", "Second result not a table.");
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ToMapLocationFromCategoryAndColumns_ShouldGetComments()
        {
            var data = new Tuple<string, IEnumerable<IEnumerable<string>>>(
                "Header",
                new List<IEnumerable<string>> {new List<string> {"100 100 100", "This is a comment."}});

            var actual = LocationUpdate.ToMapLocationFromCategoryAndColumns(data);
            Assert.Equal("This is a comment.", actual.First().RawComment);
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ToMapLocationFromCategoryAndColumns_ShouldGetHeader()
        {
            var data = new Tuple<string, IEnumerable<IEnumerable<string>>>(
                "Header",
                new List<IEnumerable<string>> {new List<string> {"100 100 100", "This is a comment."}});

            var actual = LocationUpdate.ToMapLocationFromCategoryAndColumns(data);
            Assert.Equal("Header", actual.First().RawCategory);
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ToMapLocationFromCategoryAndColumns_ShouldGetLocationX()
        {
            var data = new Tuple<string, IEnumerable<IEnumerable<string>>>(
                "Header",
                new List<IEnumerable<string>> {new List<string> {"100 -200 300", "This is a comment."}});


            var actual = LocationUpdate.ToMapLocationFromCategoryAndColumns(data);
            Assert.Equal(100, actual.First().X);
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ToMapLocationFromCategoryAndColumns_ShouldGetLocationY()
        {
            var data = new Tuple<string, IEnumerable<IEnumerable<string>>>(
                "Header",
                new List<IEnumerable<string>> {new List<string> {"100 -200 300", "This is a comment."}});

            var actual = LocationUpdate.ToMapLocationFromCategoryAndColumns(data);
            Assert.Equal(300, actual.First().Y);
        }

        [Fact]
        [Trait("Category", "Locations")]
        public void ToMapLocationFromCategoryAndColumns_ShouldGetLocationZ()
        {
            var data = new Tuple<string, IEnumerable<IEnumerable<string>>>(
                "Header",
                new List<IEnumerable<string>> {new List<string> {"100 -200 300", "This is a comment."}});

            var actual = LocationUpdate.ToMapLocationFromCategoryAndColumns(data);
            Assert.Equal(-200, actual.First().Z);
        }
    }
}