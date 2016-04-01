


protocol Renderer {
	func render(string: Path, context: [String: Any])
}

class OrcaMustache: Renderer {
	private var mustache = Mustache()
	var shouldAcceptIncludes: Bool
	func render(string: Path, context: [String: Any]) -> String {
		return self.mustache.doMustacheThing(string, context)
	}
}

class PrintRendrer: Renderer {
	func render(string: Path, context: [String: Any]) -> String {
		print("tried to render path with context ")
		return ""
	}
}

class OrcaHandlebars: Renderer {
	func render(string: Path, context: [String: Any]) -> String {
		return self.mustache.doMustacheThing(string, context)
	}
}





class iTunesWidget {
	var renderer: OrcaHandlebars()

	func start() {
		self.renderer.shouldAccceptIncludes = true
	}
}